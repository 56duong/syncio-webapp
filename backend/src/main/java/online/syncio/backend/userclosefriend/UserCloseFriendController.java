package online.syncio.backend.userclosefriend;

import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping(value = "/api/v1/userclosefriends")
@AllArgsConstructor
public class UserCloseFriendController {

    private final UserCloseFriendService userCloseFriendService;


    /**
     * Remove a user from close friends.
     * If the user is not in close friends, return false. Otherwise, remove the user from close friends and return true.
     * @param friendId
     * @return
     */
    @PostMapping("/remove-close-friend/{friendId}")
    public ResponseEntity<Boolean> removeCloseFriend(@PathVariable UUID friendId) {
        boolean isRemoved = userCloseFriendService.removeCloseFriend(friendId);
        return ResponseEntity.ok(isRemoved);
    }


    /**
     * Toggle close friend status of a user.
     * @param targetId
     * @return
     */
    @PostMapping("/toggle-close-friend/{targetId}")
    public ResponseEntity<Boolean> toggleCloseFriend(@PathVariable UUID targetId) {
        return ResponseEntity.ok(userCloseFriendService.toggleCloseFriend(targetId));
    }

}
