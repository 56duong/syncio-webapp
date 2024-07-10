package online.syncio.backend.user;

import lombok.RequiredArgsConstructor;
import online.syncio.backend.comment.CommentRepository;
import online.syncio.backend.exception.NotFoundException;
import online.syncio.backend.like.LikeRepository;
import online.syncio.backend.post.Post;
import online.syncio.backend.post.PostDTO;
import online.syncio.backend.post.PostRepository;
import online.syncio.backend.post.photo.PhotoDTO;
import online.syncio.backend.storyview.StoryViewRepository;
import online.syncio.backend.userclosefriend.UserCloseFriendRepository;
import online.syncio.backend.userfollow.UserFollowRepository;
import online.syncio.backend.utils.AuthUtils;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final LikeRepository likeRepository;
    private final CommentRepository commentRepository;
    private final StoryViewRepository storyViewRepository;
    private final AuthUtils authUtils;
    private final PasswordEncoder passwordEncoder;
    private final PostRepository postRepository;
    private final UserFollowRepository userFollowRepository;
    private final UserCloseFriendRepository userCloseFriendRepository;


    //    CRUD
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
                .map(user -> mapToDTO(user,  new UserDTO()))
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
                .map(user -> mapToUserProfile(user,  new UserProfile()))
                .toList();
    }

    public UserDTO get (final UUID id) {
        return userRepository.findById(id)
                             .map(user -> mapToDTO(user, new UserDTO()))
                             .orElseThrow(() -> new NotFoundException(User.class, "id", id.toString()));
    }

    public UserProfile getUserProfile (final UUID id)  {
        return userRepository.findByIdWithPosts(id)
                             .map(user -> mapToUserProfile(user, new UserProfile()))
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
                    .map(user -> mapToDTO(user, new UserDTO()))
                    .toList();
    }

    public String getUsernameById(final UUID id) {
        return userRepository.findUsernameById(id);
    }

    public UserDTO getUserByUsername (String username) {
        return userRepository.findByUsername(username)
                .map(user -> mapToDTO(user, new UserDTO()))
                .orElseThrow(() -> new NotFoundException(User.class, "username", username));
    }

    public List<UserStoryDTO> findAllUsersWithAtLeastOneStoryAfterCreatedDate(final LocalDateTime createdDate) {
        final List<User> users = userRepository.findAllUsersWithAtLeastOneStoryAfterCreatedDate(createdDate);
        final UUID currentUserId = authUtils.getCurrentLoggedInUserId();
        return users.stream()
                .map(user -> mapToUserStoryDTO(user, new UserStoryDTO(), currentUserId))
                .toList();
    }

    public UUID create(final UserDTO userDTO) {

        // encode password
        String encodePassword = passwordEncoder.encode(userDTO.getPassword());
        userDTO.setPassword(encodePassword);
        
        final User user = new User();
        mapToEntity(userDTO, user);
        return userRepository.save(user).getId();
    }

    public void update (final UUID id, final UserDTO userDTO) {
        final User user = userRepository.findById(id)
                                        .orElseThrow(() -> new NotFoundException(User.class, "id", id.toString()));

        String encodePassword = passwordEncoder.encode(userDTO.getPassword());
        userDTO.setPassword(encodePassword);

        mapToEntity(userDTO, user);
        userRepository.save(user);
    }

    public void delete (final UUID id) {
        final User user = userRepository.findById(id)
                                        .orElseThrow(() -> new NotFoundException(User.class, "id", id.toString()));
        userRepository.delete(user);
    }


    //    MAPPER
    private UserDTO mapToDTO (final User user, final UserDTO userDTO) {
        userDTO.setId(user.getId());
        userDTO.setEmail(user.getEmail());
        userDTO.setUsername(user.getUsername());
        userDTO.setPassword(user.getPassword());
        userDTO.setAvtURL(user.getAvtURL());
        userDTO.setCoverURL(user.getCoverURL());
        userDTO.setBio(user.getBio());
        userDTO.setCreatedDate(user.getCreatedDate());
        userDTO.setRole(user.getRole());
        userDTO.setStatus(user.getStatus());
        userDTO.setFollowerCount(user.getFollowers().size());
        return userDTO;
    }

    private UserProfile mapToUserProfile (final User user, final UserProfile userProfile) {
        final UUID currentUserId = authUtils.getCurrentLoggedInUserId();
        if(currentUserId != null) {
            User currentUser = userRepository.findById(currentUserId)
                    .orElseThrow(() -> new NotFoundException(User.class, "id", currentUserId.toString()));
            boolean isCloseFriend = userCloseFriendRepository.existsByTargetIdAndActorId(user.getId(), currentUserId);
            userProfile.setCloseFriend(isCloseFriend);
            boolean isFollowing = userFollowRepository.existsByTargetIdAndActorId(user.getId(), currentUserId);
            userProfile.setFollowing(isFollowing);
        }

        userProfile.setId(user.getId());
        userProfile.setUsername(user.getUsername());
        userProfile.setAvtURL(user.getAvtURL());
        userProfile.setBio(user.getBio());
        userProfile.setFollowerCount(user.getFollowers().size());
        userProfile.setFollowingCount(user.getFollowing().size());

        return userProfile;
    }


    private UserStoryDTO mapToUserStoryDTO (final User user, final UserStoryDTO userStoryDTO, final UUID currentUserId) {
        userStoryDTO.setId(user.getId());
        userStoryDTO.setUsername(user.getUsername());
        userStoryDTO.setAvtURL(user.getAvtURL());
        userStoryDTO.setHasUnseenStory(storyViewRepository.hasUnseenStoriesFromCreatorSinceDate(user.getId(), currentUserId, LocalDateTime.now().minusDays(1)));
        return userStoryDTO;
    }



    private User mapToEntity (final UserDTO userDTO, final User user) {
        user.setEmail(userDTO.getEmail());
        user.setUsername(userDTO.getUsername());
        user.setPassword(userDTO.getPassword());
        user.setAvtURL(userDTO.getAvtURL());
        user.setCoverURL(userDTO.getCoverURL());
        user.setBio(userDTO.getBio());
        user.setCreatedDate(userDTO.getCreatedDate());
        user.setRole(userDTO.getRole());
        user.setStatus(userDTO.getStatus());
        return user;
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
                .map(user -> mapToDTO(user, new UserDTO()))
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
