package online.syncio.backend.user;

import lombok.RequiredArgsConstructor;
import online.syncio.backend.comment.CommentRepository;
import online.syncio.backend.exception.AppException;
import online.syncio.backend.exception.NotFoundException;
import online.syncio.backend.like.LikeRepository;
import online.syncio.backend.post.PostRepository;
import online.syncio.backend.utils.AuthUtils;
import online.syncio.backend.utils.FileUtils;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final LikeRepository likeRepository;
    private final CommentRepository commentRepository;
    private final AuthUtils authUtils;
    private final PasswordEncoder passwordEncoder;
    private final PostRepository postRepository;
    private final FileUtils fileUtils;
    private final UserMapper userMapper;


    public List<UserDTO> findAll (Optional<String> username) {
//        final List<User> users = userRepository.findAll(Sort.by("createdDate").descending());
//        return users.stream()
//                    .map(user -> mapToDTO(user, new UserDTO()))
//                    .toList();
        List<User> users;
        if (username.isPresent()) {
            users = userRepository.findByUsernameContaining(username.get());
        } else {
            users = userRepository.findAll(Sort.by("createdDate").descending());
        }
        return users.stream()
                .map(user -> userMapper.mapToDTO(user,  new UserDTO()))
                .toList();
    }

    public List<UserProfile> searchUsers (Optional<String> username) {
        List<User> users;
        if (username.isPresent()) {
            users = userRepository.findByUsernameContaining(username.get());
        } else {
            users = userRepository.findAll(Sort.by("createdDate").descending());
        }
        return users.stream()
                .map(user -> userMapper.mapToUserProfile(user,  new UserProfile()))
                .toList();
    }

    public UserDTO get (final UUID id) {
        return userRepository.findById(id)
                .map(user -> userMapper.mapToDTO(user, new UserDTO()))
                .orElseThrow(() -> new NotFoundException(User.class, "id", id.toString()));
    }

    public UserProfile getUserProfile (final UUID id)  {
        return userRepository.findByIdWithPosts(id)
                .map(user -> userMapper.mapToUserProfile(user, new UserProfile()))
                .orElseThrow(() -> new NotFoundException(User.class, "id", id.toString()));
    }

    @jakarta.transaction.Transactional
    public User updateProfile(final UUID id,UpdateProfileDTO updatedUser) throws Exception {
        final User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(User.class, "id", id.toString()));

        if (!existingUser.getUsername().equals(updatedUser.getUsername())) {
            if (existingUser.getUsernameLastModified() != null &&
                    ChronoUnit.DAYS.between(existingUser.getUsernameLastModified(), LocalDateTime.now()) < 60) {
                throw new Exception("Username can only be changed once every 60 days.");
            }
            existingUser.setUsername(updatedUser.getUsername());
            existingUser.setUsernameLastModified(LocalDateTime.now());
        }

        if (updatedUser.getEmail() != null) {
            existingUser.setEmail(updatedUser.getEmail());
        }

        if (updatedUser.getBio() != null) {
            existingUser.setBio(updatedUser.getBio());
        }


        return userRepository.save(existingUser);

    }

    public List<UserDTO> findTop20ByUsernameContainingOrEmailContaining (final String username, final String email) {
        final List<User> users = userRepository.findTop20ByUsernameContainingOrEmailContaining(username, email);
        return users.stream()
                .map(user -> userMapper.mapToDTO(user, new UserDTO()))
                .toList();
    }

    public String getUsernameById(final UUID id) {
        return userRepository.findUsernameById(id);
    }

    public UserDTO getUserByUsername (String username) {
        return userRepository.findByUsername(username)
                .map(user -> userMapper.mapToDTO(user, new UserDTO()))
                .orElseThrow(() -> new NotFoundException(User.class, "username", username));
    }

    public List<UserStoryDTO> findAllUsersWithAtLeastOneStoryAfterCreatedDate(final LocalDateTime createdDate) {
        final List<User> users = userRepository.findAllUsersWithAtLeastOneStoryAfterCreatedDate(createdDate);
        final UUID currentUserId = authUtils.getCurrentLoggedInUserId();
        return users.stream()
                .map(user -> userMapper.mapToUserStoryDTO(user, new UserStoryDTO(), currentUserId))
                .toList();
    }

    public UUID create(final UserDTO userDTO) {

        // encode password
        String encodePassword = passwordEncoder.encode(userDTO.getPassword());
        userDTO.setPassword(encodePassword);

        final User user = new User();
        userMapper.mapToEntity(userDTO, user);
        return userRepository.save(user).getId();
    }

    public void update (final UUID id, final UserDTO userDTO) {
        final User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(User.class, "id", id.toString()));

        String encodePassword = passwordEncoder.encode(userDTO.getPassword());
        userDTO.setPassword(encodePassword);

        userMapper.mapToEntity(userDTO, user);
        userRepository.save(user);
    }

    public void delete (final UUID id) {
        final User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(User.class, "id", id.toString()));
        userRepository.delete(user);
    }

    public String updateAvatar(MultipartFile file) {
        final UUID id = authUtils.getCurrentLoggedInUserId();
        final User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(User.class, "id", id.toString()));
        try {
            return fileUtils.storeFile(file, "users", true);
        } catch (IOException e) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Could not store file", e);
        }
    }


    public void enableUser (UUID id) {
        userRepository.enableUser(id);
    }


    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    // get new users count in last N days
    public Map<String, Long> getNewUsersLastNDays(int days) {
        LocalDateTime startDate = LocalDateTime.now().minusDays(days);
        List<Object[]> results = userRepository.countNewUsersSince(startDate);

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        Map<String, Long> newUsersCount = new HashMap<>();
        for (Object[] result : results) {
            newUsersCount.put(result[0].toString(), (Long) result[1]);
        }
        return newUsersCount;
    }

    public List<UserDTO> getOutstandingUsers() {
        List<User> users = userRepository.findAll();
        return users.stream()
                .filter(this::hasOutstandingInteractions)
                .map(user -> userMapper.mapToDTO(user, new UserDTO()))
                .toList();
    }

    private boolean hasOutstandingInteractions(User user) {
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minus(InteractionCriteria.TIME_PERIOD);

        long recentPosts = postRepository.countByCreatedByAndCreatedDateAfter(user, sevenDaysAgo);
        long recentLikes = likeRepository.countByUserAndPostCreatedDateAfter(user, sevenDaysAgo);
        long recentComments = commentRepository.countByUserAndCreatedDateAfter(user, sevenDaysAgo);

        return recentPosts >= InteractionCriteria.MIN_POSTS &&
                recentLikes >= InteractionCriteria.MIN_LIKES &&
                recentComments >= InteractionCriteria.MIN_COMMENTS;
    }

}