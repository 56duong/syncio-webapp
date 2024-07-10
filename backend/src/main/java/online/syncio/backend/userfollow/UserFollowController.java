package online.syncio.backend.userfollow;

import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping(value = "/api/v1/userfollows")
@AllArgsConstructor
public class UserFollowController {

    private final UserFollowService userFollowService;


    /**
     * Toggle follow status of a user.
     * @param targetId
     * @return
     */
    @PostMapping("/toggle-follow/{targetId}")
    public ResponseEntity<Boolean> toggleFollow(@PathVariable UUID targetId) {
        return ResponseEntity.ok(userFollowService.toggleFollow(targetId));
    }


    /**
     * Remove a user from followers.
     * If the user is not a follower, return false. Otherwise, remove the user from followers and return true.
     * @param actorId
     * @return
     */
    @DeleteMapping("/remove-follower/{actorId}")
    public ResponseEntity<Boolean> removeFollower(@PathVariable UUID actorId) {
        return ResponseEntity.ok(userFollowService.removeFollower(actorId));
    }


    @GetMapping("/{userId}/followers")
    public Page<UserFollowDTO> getFollowersSortedByMutualFollow(@PathVariable UUID userId,
                                                                @RequestParam(defaultValue = "0") int pageNumber,
                                                                @RequestParam(defaultValue = "10") int pageSize) {
        return userFollowService.getFollowersSortedByMutualFollow(userId, PageRequest.of(pageNumber, pageSize));
    }


    @GetMapping("/{userId}/following")
    public Page<UserFollowDTO> getFollowingSortedByMutualFollow(@PathVariable UUID userId,
                                                                @RequestParam(defaultValue = "0") int pageNumber,
                                                                @RequestParam(defaultValue = "10") int pageSize) {
        return userFollowService.getFollowingsSortedByMutualFollow(userId, PageRequest.of(pageNumber, pageSize));
    }

}
