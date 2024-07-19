package online.syncio.backend.userfollow;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import online.syncio.backend.exception.NotFoundException;
import online.syncio.backend.user.User;
import online.syncio.backend.user.UserRepository;
import online.syncio.backend.utils.AuthUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@AllArgsConstructor
public class UserFollowService {

    private final UserFollowRepository userFollowRepository;
    private final AuthUtils authUtils;
    private final UserRepository userRepository;
    private final UserFollowMapper userFollowMapper;


    @Transactional
    public boolean toggleFollow(final UUID targetId) {
        final UUID currentUserId = authUtils.getCurrentLoggedInUserId();
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new NotFoundException(User.class, "id", currentUserId.toString()));
        User target = userRepository.findById(targetId)
                .orElseThrow(() -> new NotFoundException(User.class, "id", targetId.toString()));

        boolean isFollowing = userFollowRepository.existsByTargetIdAndActorId(targetId, currentUserId);

        if (isFollowing) {
            userFollowRepository.deleteByTargetIdAndActorId(targetId, currentUserId);
            return false; // Successfully unfollowed
        }
        else {
            UserFollow userFollow = new UserFollow();
            userFollow.setTarget(target);
            userFollow.setActor(user);
            userFollowRepository.save(userFollow);
            return true; // Successfully followed
        }
    }

    public boolean addFollow(UUID targetId) {
        final UUID currentUserId = authUtils.getCurrentLoggedInUserId();
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new NotFoundException(User.class, "id", currentUserId.toString()));
        User target = userRepository.findById(targetId)
                .orElseThrow(() -> new NotFoundException(User.class, "id", targetId.toString()));

        boolean isFollow = userFollowRepository.existsByTargetIdAndActorId(targetId, currentUserId);

        // if not following
        if (!isFollow) {
            UserFollow userFollow = new UserFollow();
            userFollow.setTarget(target);
            userFollow.setActor(user);
            userFollowRepository.save(userFollow);
            return true; // Successfully added to following
        }
        return false; // Already following
    }

    @Transactional
    public boolean removeFollower(UUID actorId) {
        final UUID currentUserId = authUtils.getCurrentLoggedInUserId();
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new NotFoundException(User.class, "id", currentUserId.toString()));
        User actor = userRepository.findById(actorId)
                .orElseThrow(() -> new NotFoundException(User.class, "id", actorId.toString()));

        boolean isFollow = userFollowRepository.existsByTargetIdAndActorId(actorId, currentUserId);

        // if already following
        if (isFollow) {
            // remove from following
            userFollowRepository.deleteByTargetIdAndActorId(currentUserId, actorId);
            return true; // Successfully removed from following
        }
        return false; // Not following
    }


    public Page<UserFollowDTO> getFollowersSortedByMutualFollow(UUID userId, Pageable pageable) {
        final UUID currentUserId = authUtils.getCurrentLoggedInUserId();
        Page<UserFollow> userFollows = userFollowRepository.findFollowersSortedByMutualFollow(userId, currentUserId, pageable);
        return userFollows.map(userFollow -> userFollowMapper.mapToDTO(false, userFollow, new UserFollowDTO()));
    }

    public Page<UserFollowDTO> getFollowingsSortedByMutualFollow(UUID userId, Pageable pageable) {
        final UUID currentUserId = authUtils.getCurrentLoggedInUserId();
        Page<UserFollow> userFollows = userFollowRepository.findFollowingsSortedByMutualFollow(userId, currentUserId, pageable);
        return userFollows.map(userFollow -> userFollowMapper.mapToDTO(true, userFollow, new UserFollowDTO()));
    }

}
