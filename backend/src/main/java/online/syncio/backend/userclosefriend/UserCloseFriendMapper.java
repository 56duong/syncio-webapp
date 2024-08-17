package online.syncio.backend.userclosefriend;

import lombok.AllArgsConstructor;
import online.syncio.backend.exception.NotFoundException;
import online.syncio.backend.user.User;
import online.syncio.backend.user.UserRepository;
import online.syncio.backend.userfollow.UserFollow;
import online.syncio.backend.userfollow.UserFollowDTO;
import online.syncio.backend.userfollow.UserFollowRepository;
import online.syncio.backend.utils.AuthUtils;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@AllArgsConstructor
public class UserCloseFriendMapper {

    private final UserFollowRepository userFollowRepository;
    private final UserRepository userRepository;
    private final AuthUtils authUtils;


    public UserFollowDTO mapToDTO(boolean getFollowing, final UserFollow userFollow, final UserFollowDTO userFollowDTO) {
        userFollowDTO.setTargetId(userFollow.getTarget().getId());
        userFollowDTO.setActorId(userFollow.getActor().getId());
        userFollowDTO.setCreatedDate(userFollow.getCreatedDate());
        userFollowDTO.setTargetUsername(userFollow.getTarget().getUsername());
        userFollowDTO.setActorUsername(userFollow.getActor().getUsername());
        final UUID currentUserId = authUtils.getCurrentLoggedInUserId();
        if (currentUserId != null) {
            if(getFollowing) {
                userFollowDTO.setFollowing(userFollowRepository.existsByTargetIdAndActorId(userFollow.getTarget().getId(), currentUserId));
            }
            else {
                userFollowDTO.setFollowing(userFollowRepository.existsByTargetIdAndActorId(userFollow.getActor().getId(), currentUserId));
            }
        }
        return userFollowDTO;
    }


    public UserFollow mapToEntity(final UserFollowDTO userFollowDTO, final UserFollow userFollow) {
        final User user = userFollowDTO.getTargetId() == null ? null : userRepository.findById(userFollowDTO.getTargetId())
                .orElseThrow(() -> new NotFoundException(User.class, "id", userFollowDTO.getTargetId().toString()));
        userFollow.setTarget(user);

        final User relatedUser = userFollowDTO.getActorId() == null ? null : userRepository.findById(userFollowDTO.getActorId())
                .orElseThrow(() -> new NotFoundException(User.class, "id", userFollowDTO.getActorId().toString()));
        userFollow.setActor(relatedUser);

        userFollow.setCreatedDate(userFollowDTO.getCreatedDate());
        return userFollow;
    }

}
