package online.syncio.backend.userclosefriend;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import online.syncio.backend.exception.NotFoundException;
import online.syncio.backend.user.User;
import online.syncio.backend.user.UserRedisService;
import online.syncio.backend.user.UserRepository;
import online.syncio.backend.utils.AuthUtils;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@AllArgsConstructor
public class UserCloseFriendService {

    private final UserCloseFriendRepository userCloseFriendRepository;
    private final AuthUtils authUtils;
    private final UserRepository userRepository;
    private final UserRedisService userRedisService;

    /**
     * Toggle close friend status of a user.
     * @param targetId
     * @return
     */
    @Transactional
    public boolean toggleCloseFriend(final UUID targetId) {
        final UUID currentUserId = authUtils.getCurrentLoggedInUserId();
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new NotFoundException(User.class, "id", currentUserId.toString()));
        User target = userRepository.findById(targetId)
                .orElseThrow(() -> new NotFoundException(User.class, "id", targetId.toString()));

        boolean isCloseFriend = userCloseFriendRepository.existsByTargetIdAndActorId(targetId, currentUserId);

        if (isCloseFriend) {
            userCloseFriendRepository.deleteByTargetIdAndActorId(targetId, currentUserId);
            return false; // Successfully removed from close friends
        }
        else {
            UserCloseFriend userCloseFriend = new UserCloseFriend();
            userCloseFriend.setTarget(target);
            userCloseFriend.setActor(user);
            userCloseFriendRepository.save(userCloseFriend);
            return true; // Successfully added to close friends
        }
    }


    /**
     * Remove a user from close friends.
     * If the user is not in close friends, return false. Otherwise, remove the user from close friends and return true.
     * @param targetId
     * @return
     */
    public boolean removeCloseFriend(UUID targetId) {
        final UUID currentUserId = authUtils.getCurrentLoggedInUserId();

        boolean isCloseFriend = userCloseFriendRepository.existsByTargetIdAndActorId(targetId, currentUserId);

        // if close friend
        if (isCloseFriend) {
            // remove from close friends
            userCloseFriendRepository.deleteByTargetIdAndActorId(targetId, currentUserId);
            userRedisService.invalidateUserProfileCache(targetId);
            return true; // Successfully removed from close friends
        }
        userRedisService.invalidateUserProfileCache(targetId);
        return false; // Not in close friends

    }


    public List<UserFollowingCloseFriendDTO> getFollowingCloseFriends() {
        final UUID currentUserId = authUtils.getCurrentLoggedInUserId();
        List<UserFollowingCloseFriendDTO> closeFriends = userCloseFriendRepository.getFollowingCloseFriends(currentUserId);

        // Sort the list so that close friends come first
        closeFriends.sort((friend1, friend2) -> Boolean.compare(friend2.isCloseFriend(), friend1.isCloseFriend()));

        return closeFriends;
    }

}
