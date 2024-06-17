package online.syncio.backend.user;

import jakarta.validation.Valid;
import online.syncio.backend.exception.ReferencedException;
import online.syncio.backend.exception.ReferencedWarning;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping(value = "/api/v1/users")
public class UserController {

    private final UserService userService;

    public UserController (final UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers () {
        return ResponseEntity.ok(userService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUser (@PathVariable(name = "id") final UUID id) {
        return ResponseEntity.ok(userService.get(id));
    }

    @GetMapping("/{id}/username")
    public ResponseEntity<Map<String, String>> getUsername(@PathVariable(name = "id") final UUID id) {
        final String username = userService.getUsernameById(id);
        return ResponseEntity.ok(Collections.singletonMap("username", username));
    }

    @GetMapping("/search")
    public ResponseEntity<List<UserDTO>> searchUsers (@RequestParam(name = "username", required = false) final String username,
                                                      @RequestParam(name = "email", required = false) final String email) {
        return ResponseEntity.ok(userService.findTop20ByUsernameContainingOrEmailContaining(username, email));
    }

    /**
     * Get all users with at least one story created in the last 24 hours
     * @return a list of users
     */
    @GetMapping("/stories")

    public ResponseEntity<List<UserStoryDTO>> getUsersWithStories() {
        return ResponseEntity.ok(userService.findAllUsersWithAtLeastOneStoryAfterCreatedDate(LocalDateTime.now().minusDays(1)));
    }

    @PostMapping
    public ResponseEntity<UUID> createUser (@RequestBody @Valid final UserDTO userDTO) {
        final UUID createdId = userService.create(userDTO);
        return new ResponseEntity<>(createdId, HttpStatus.CREATED);
    }


    /* @Valid isn't needed here because only these info will modified:
     *  username, password, email and bio
     *  */
    @PutMapping("/{id}")
    public ResponseEntity<UUID> updateUser (@PathVariable(name = "id") final UUID id,
                                            @RequestBody final UserDTO userDTO) {
        userService.update(id, userDTO);
        return ResponseEntity.ok(id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser (@PathVariable(name = "id") final UUID id) {
        final ReferencedWarning referencedWarning = userService.getReferencedWarning(id);
        if (referencedWarning != null) {
            throw new ReferencedException(referencedWarning);
        }
        userService.delete(id);
        return ResponseEntity.noContent().build();
    }


    @GetMapping("/profile/{id}")
    public ResponseEntity<UserProfile> getUserProfile (@PathVariable(name = "id") final UUID id) {
        return ResponseEntity.ok(userService.getUserProfile(id));
    }

    @GetMapping("/last/{days}")
    public Map<String, Long> getNewUsersLastNDays(@PathVariable(name = "days") final int days) {
        return userService.getNewUsersLastNDays(days);
    }

    @GetMapping("/outstanding")
    public ResponseEntity<List<UserDTO>> getOutstandingUsers() {
        return ResponseEntity.ok(userService.getOutstandingUsers());
    }
}
