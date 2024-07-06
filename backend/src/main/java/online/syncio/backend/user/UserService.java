package online.syncio.backend.user;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import online.syncio.backend.comment.Comment;
import online.syncio.backend.comment.CommentRepository;
import online.syncio.backend.exception.DataNotFoundException;
import online.syncio.backend.exception.NotFoundException;
import online.syncio.backend.exception.ReferencedWarning;
import online.syncio.backend.like.Like;
import online.syncio.backend.like.LikeRepository;
import online.syncio.backend.messagecontent.MessageContent;
import online.syncio.backend.messagecontent.MessageContentRepository;
import online.syncio.backend.messageroommember.MessageRoomMember;
import online.syncio.backend.messageroommember.MessageRoomMemberRepository;
import online.syncio.backend.post.*;
import online.syncio.backend.post.photo.PhotoDTO;
import online.syncio.backend.report.Report;
import online.syncio.backend.report.ReportRepository;
import online.syncio.backend.storyview.StoryViewRepository;
import online.syncio.backend.utils.AuthUtils;
import online.syncio.backend.utils.ConstantsMessage;
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
    private final ReportRepository reportRepository;
    private final MessageRoomMemberRepository messageRoomMemberRepository;
    private final MessageContentRepository messageContentRepository;
    private final PostService postService;
    private final StoryViewRepository storyViewRepository;
    private final AuthUtils authUtils;
    private final PasswordEncoder passwordEncoder;
    private final PostRepository postRepository;


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

    public UserDTO get (final UUID id) {
        return userRepository.findById(id)
                             .map(user -> mapToDTO(user, new UserDTO()))
                             .orElseThrow(() -> new NotFoundException(User.class, "id", id.toString()));
    }

    public UserProfile getUserProfile (final UUID id)  {
        return userRepository.findByIdWithPosts(id)
                             .map(user -> {
                                 try {
                                     return mapToUserProfile(user, new UserProfile());
                                 } catch (DataNotFoundException e) {
                                     throw new RuntimeException(e);
                                 }
                             })
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

    private UserProfile mapToUserProfile (final User user, final UserProfile userProfile) throws DataNotFoundException {
        final UUID currentUserId = authUtils.getCurrentLoggedInUserId();
        if(currentUserId != null) {
            User currentUser = userRepository.findById(currentUserId)
                    .orElseThrow(() -> new NotFoundException(User.class, "id", currentUserId.toString()));
            boolean isCloseFriend = currentUser.getCloseFriends().contains(user);
            userProfile.setCloseFriend(isCloseFriend);
            boolean isFollowing = currentUser.getFollowing().contains(user);
            userProfile.setFollowing(isFollowing);
        }

        userProfile.setId(user.getId());
        userProfile.setUsername(user.getUsername());
        userProfile.setAvtURL(user.getAvtURL());
        userProfile.setBio(user.getBio());
        LinkedHashSet<PostDTO> posts = user.getPosts().stream()
                .filter(this::isUserCanSeePost)
                .sorted(Comparator.comparing(Post::getCreatedDate).reversed())
                .map(this::convertToPostDTO)
                .collect(Collectors.toCollection(LinkedHashSet::new));
        userProfile.setPosts(posts);
        userProfile.setFollowerCount(user.getFollowers().size());
        userProfile.setFollowingCount(user.getFollowing().size());

        return userProfile;
    }

    private boolean isUserCanSeePost (final Post post) {
        UUID currentUserId = authUtils.getCurrentLoggedInUserId();
        User currentUser = new User();
        if (currentUserId != null) {
            currentUser = userRepository.findById(currentUserId)
                    .orElseThrow(() -> new NotFoundException(User.class, "id", currentUserId.toString()));
        }

        return post.getVisibility() == PostEnum.PUBLIC
            || (currentUserId != null
                && (
                    currentUser.equals(post.getCreatedBy())
                    || currentUser.getRole().equals(RoleEnum.ADMIN)
                    || (post.getVisibility() == PostEnum.CLOSE_FRIENDS && (post.getCreatedBy().getCloseFriends().contains(currentUser)))
                    || (post.getVisibility() == PostEnum.PRIVATE && post.getCreatedBy().equals(currentUser))
                )
            );
    }


    private PostDTO convertToPostDTO(Post post) {
        PostDTO postDTO = new PostDTO();

        // Set fields from Post entity to PostDTO
        postDTO.setId(post.getId());
        postDTO.setCaption(post.getCaption());

        List<PhotoDTO> photos = post.getPhotos().stream()
                .map(photo -> {
                    PhotoDTO photoDTO = new PhotoDTO();
                    photoDTO.setId(photo.getId());
                    photoDTO.setUrl(photo.getUrl());
                    photoDTO.setAltText(photo.getAltText());
                    photoDTO.setPostId(photo.getPost().getId());
                    return photoDTO;
                })
                .collect(Collectors.toList());
        postDTO.setPhotos(photos);

        postDTO.setCreatedDate(post.getCreatedDate());
        postDTO.setFlag(post.getFlag());

        // Set the createdBy field to the ID of the user who created the post
        if (post.getCreatedBy() != null) {
            postDTO.setCreatedBy(post.getCreatedBy().getId());
        }

        return postDTO;
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


    //    REFERENCED
    public ReferencedWarning getReferencedWarning (final UUID id) {
        final ReferencedWarning referencedWarning = new ReferencedWarning();
        final User user = userRepository.findById(id)
                                        .orElseThrow(() -> new NotFoundException(User.class, "id", id.toString()));

        // Like
        final Like userLike = likeRepository.findFirstByUser(user);
        if (userLike != null) {
            referencedWarning.setKey("user.like.user.referenced");
            referencedWarning.addParam(userLike.getPost().getId());
            return referencedWarning;
        }

        // Comment
        final Comment userComment = commentRepository.findFirstByUser(user);
        if (userComment != null) {
            referencedWarning.setKey("user.comment.user.referenced");
            referencedWarning.addParam(userComment.getPost().getId());
            return referencedWarning;
        }

        // Report
        final Report userReport = reportRepository.findFirstByUser(user);
        if (userReport != null) {
            referencedWarning.setKey("user.report.user.referenced");
            referencedWarning.addParam(userReport.getPost().getId());
            return referencedWarning;
        }

        // MessageRoomMember
        final MessageRoomMember userMessageRoomMember = messageRoomMemberRepository.findFirstByUser(user);
        if (userMessageRoomMember != null) {
            referencedWarning.setKey("user.messageRoomMember.user.referenced");
            referencedWarning.addParam(userMessageRoomMember.getMessageRoom().getId());
            return referencedWarning;
        }

        // MessageContent
        final MessageContent userMessageContent = messageContentRepository.findFirstByUser(user);
        if (userMessageContent != null) {
            referencedWarning.setKey("user.messageContent.user.referenced");
            referencedWarning.addParam(userMessageContent.getMessageRoom().getId());
            return referencedWarning;
        }

        return null;
    }

    public void enableUser (UUID id) {
        userRepository.enableUser(id);
    }

    @Transactional
    public boolean followUser(UUID targetId) throws DataNotFoundException {
        final UUID currentUserId = authUtils.getCurrentLoggedInUserId();
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new DataNotFoundException("Current user not found"));
        User target = userRepository.findById(targetId)
                .orElseThrow(() -> new DataNotFoundException("Target user not found"));

        // Check if already following
        if (!user.getFollowing().contains(target)) {
            user.getFollowing().add(target);
            target.getFollowers().add(user);  // Ensure consistency

            userRepository.save(user);
            userRepository.save(target);
            return true;  // Successfully followed
        }
        return false;  // Already following
    }

    public boolean unfollowUser( UUID targetId) {

        final UUID currentUserId = authUtils.getCurrentLoggedInUserId();
        User user = userRepository.findById(currentUserId).orElseThrow(() -> new RuntimeException("User not found"));
        User target = userRepository.findById(targetId).orElseThrow(() -> new RuntimeException("Target user not found"));

        if (user.getFollowing().contains(target)) {
            user.getFollowing().remove(target);
            target.getFollowers().remove(user); // Also remove the user from target's followers set

            userRepository.save(user);
            userRepository.save(target); // Save the target as well to persist changes
            return true;
        }
        return false;
    }

    public boolean isFollowing(UUID userId, UUID targetId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        User target = userRepository.findById(targetId)
                .orElseThrow(() -> new RuntimeException("Target user not found"));

        return user.getFollowing().contains(target);
    }

    public boolean addCloseFriend( UUID friendId) {
        final UUID currentUserId = authUtils.getCurrentLoggedInUserId();
        User user = userRepository.findById(currentUserId).orElseThrow(() -> new RuntimeException("User not found"));
        Optional<User> friendOpt = userRepository.findById(friendId);

        if (!friendOpt.isPresent()) {
            throw new RuntimeException("User not found.");
        }
        User friend = friendOpt.get();

        if (user.getFollowing().contains(friend)) {
            user.getCloseFriends().add(friend);
            userRepository.save(user);
            return true;
        } else {
            return false;
        }
    }

    public boolean removeCloseFriend(UUID friendId) throws DataNotFoundException {
        Optional<User> friendOpt = userRepository.findById(friendId);
        if (!friendOpt.isPresent()) {
            throw new DataNotFoundException(ConstantsMessage.USER_NOT_FOUND);
        }

        User friend = friendOpt.get();
        final UUID currentUserId = authUtils.getCurrentLoggedInUserId();
        User currentUser = userRepository.findById(currentUserId).orElseThrow(() -> new RuntimeException("User not found"));

        if (currentUser.getCloseFriends().contains(friend)) {
            currentUser.getCloseFriends().remove(friend);
            userRepository.save(currentUser);
            return true;
        } else {
            return false;
        }
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
