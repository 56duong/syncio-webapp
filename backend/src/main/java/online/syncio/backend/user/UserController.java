package online.syncio.backend.user;

import jakarta.validation.Valid;
import online.syncio.backend.auth.responses.LoginResponse;
import online.syncio.backend.auth.responses.ResponseObject;
import online.syncio.backend.exception.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping(value = "/api/v1/users")
public class UserController {

    private final UserService userService;

    public UserController (final UserService userService, PasswordEncoder passwordEncoder) {
        this.userService = userService;
    }

//    @GetMapping
//    public ResponseEntity<List<UserDTO>> getAllUsers () {
//        return ResponseEntity.ok(userService.findAll());
//    }

    @GetMapping
    public ResponseEntity<List<UserDTO>> searchUsers (@RequestParam Optional<String> username) {
        return ResponseEntity.ok(userService.findAll(username));
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
        List<UserDTO> users = userService.findAll(Optional.empty());

        for (UserDTO user : users) {
            if (user.getUsername().equals(userDTO.getUsername())) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Username already exists!", null);
            }
        }

        for (UserDTO user : users) {
            if (user.getEmail().equals(userDTO.getEmail())) {
                throw new AppException(HttpStatus.BAD_REQUEST, "Email already exists!", null);
            }
        }

        userService.create(userDTO);
        return ResponseEntity.ok(userDTO.getId());
    }

    @PutMapping("/{id}")
    public ResponseEntity<UUID> updateUser (@PathVariable(name = "id") final UUID id,
                                            @RequestBody final UserDTO userDTO) {

        List<UserDTO> users = userService.findAll(Optional.empty());

        // index of id in users
        int currentIndex = users.indexOf(users.stream().filter(u -> u.getId().equals(id)).findFirst().get());
        System.out.println(currentIndex);

        if (users.stream().anyMatch(u -> u.getUsername().equals(userDTO.getUsername()) && users.indexOf(u) != currentIndex)) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Username already exists!", null);
        }
        
        if (users.stream().anyMatch(u -> u.getEmail().equals(userDTO.getEmail()) && users.indexOf(u) != currentIndex)) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Email already exists!", null);
        }

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
    @ResponseBody
    public ResponseEntity<UserProfile> getUserProfile (@PathVariable(name = "id") final UUID id) {
        return ResponseEntity.ok(userService.getUserProfile(id));
    }
    @PutMapping("/update-profile/{id}")
    public ResponseEntity<?> updateProfile(@PathVariable(name = "id") final UUID id, @RequestBody UpdateProfileDTO user) {
        try {
            User userDetail = userService.updateProfile( id,user);
            LoginResponse loginResponse = LoginResponse
                    .builder()
                    .message("Login successfully")
                    .bio(userDetail.getBio())
                    .email(userDetail.getEmail())
                    .username(userDetail.getUsername())
                    .roles(userDetail.getAuthorities().stream().map(GrantedAuthority::getAuthority).toList())
                    .id(userDetail.getId())
                    .build();
            return ResponseEntity.ok().body(ResponseObject.builder()
                    .message("Update successfully")
                    .data(loginResponse)
                    .status(HttpStatus.OK)
                    .build());

        } catch (NotFoundException ex) {
            return ResponseEntity.notFound().build();
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body( ex.getMessage());
        }
    }

    @PostMapping("/follow/{targetId}")
    public ResponseEntity<?> followUser(@PathVariable UUID targetId) {
        try {
            boolean result = userService.followUser(targetId);
            if (result) {
                return ResponseEntity.ok(result);
            } else {
                return ResponseEntity.badRequest().body(result);
            }
        } catch (DataNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error processing request");
        }
    }

    @PostMapping("/unfollow/{targetId}")
    public ResponseEntity<?> unfollowUser(@PathVariable UUID targetId) {

        try {
            boolean result = userService.unfollowUser(targetId);
            if (result) {
                return ResponseEntity.ok(result);
            } else {
                return ResponseEntity.badRequest().body(result);
            }

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error processing request");
        }
    }
    @GetMapping("/{userId}/is-following/{targetId}")
    public ResponseEntity<?> checkIfUserIsFollowing(
            @PathVariable UUID userId,
            @PathVariable UUID targetId
    ) {
        boolean isFollowing = userService.isFollowing(userId, targetId);
        return ResponseEntity.ok().body(isFollowing);
    }

    /**
     * Add a user to the close friends list of another user
     * @param friendId the user to add to the close friends list
     * @return a response entity with a message
     */
    @PostMapping("/add-close-friend/{friendId}")
    public ResponseEntity<?> addCloseFriend(@PathVariable UUID friendId) {
        try {
            boolean isAdded = userService.addCloseFriend(friendId);
            if (isAdded) {
                return ResponseEntity.ok(isAdded);
            } else {
                return ResponseEntity.badRequest().body(isAdded);
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("An error occurred: " + e.getMessage());
        }
    }

    @PostMapping("/remove-close-friend/{friendId}")
    public ResponseEntity<?> removeCloseFriend(@PathVariable UUID friendId) {
        try {
            boolean isRemoved = userService.removeCloseFriend(friendId);
            if (isRemoved) {
                return ResponseEntity.ok(isRemoved);
            } else {
                return ResponseEntity.badRequest().body(isRemoved);
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("An error occurred: " + e.getMessage());
        }
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
