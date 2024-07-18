package online.syncio.backend.user;

import lombok.RequiredArgsConstructor;
import online.syncio.backend.exception.NotFoundException;
import online.syncio.backend.storyview.StoryViewRepository;
import online.syncio.backend.userclosefriend.UserCloseFriendRepository;
import online.syncio.backend.userfollow.UserFollowRepository;
import online.syncio.backend.utils.AuthUtils;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class UserMapper {

    private final UserRepository userRepository;
    private final UserCloseFriendRepository userCloseFriendRepository;
    private final UserFollowRepository userFollowRepository;
    private final AuthUtils authUtils;
    private final StoryViewRepository storyViewRepository;


    public UserDTO mapToDTO (final User user, final UserDTO userDTO) {
        userDTO.setId(user.getId());
        userDTO.setEmail(user.getEmail());
        userDTO.setUsername(user.getUsername());
        userDTO.setPassword(user.getPassword());
        userDTO.setCoverURL(user.getCoverURL());
        userDTO.setBio(user.getBio());
        userDTO.setCreatedDate(user.getCreatedDate());
        userDTO.setRole(user.getRole());
        userDTO.setStatus(user.getStatus());
        userDTO.setFollowerCount(user.getFollowers().size());
        return userDTO;
    }


    public UserProfile mapToUserProfile (final User user, final UserProfile userProfile) {
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
        userProfile.setBio(user.getBio());
        userProfile.setFollowerCount(user.getFollowers().size());
        userProfile.setFollowingCount(user.getFollowing().size());

        return userProfile;
    }


    public UserStoryDTO mapToUserStoryDTO (final User user, final UserStoryDTO userStoryDTO, final UUID currentUserId) {
        userStoryDTO.setId(user.getId());
        userStoryDTO.setUsername(user.getUsername());
        userStoryDTO.setHasUnseenStory(storyViewRepository.hasUnseenStoriesFromCreatorSinceDate(user.getId(), currentUserId, LocalDateTime.now().minusDays(1)));
        return userStoryDTO;
    }


    public User mapToEntity (final UserDTO userDTO, final User user) {
        user.setEmail(userDTO.getEmail());
        user.setUsername(userDTO.getUsername());
        user.setPassword(userDTO.getPassword());
        user.setCoverURL(userDTO.getCoverURL());
        user.setBio(userDTO.getBio());
        user.setCreatedDate(userDTO.getCreatedDate());
        user.setRole(userDTO.getRole());
        user.setStatus(userDTO.getStatus());
        return user;
    }

}
