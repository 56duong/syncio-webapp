package online.syncio.backend.user;

import jakarta.validation.Valid;
import online.syncio.backend.exception.ReferencedException;
import online.syncio.backend.exception.ReferencedWarning;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
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

    @GetMapping("/search")
    public ResponseEntity<List<UserDTO>> searchUsers (@RequestParam(name = "username", required = false) final String username,
                                                      @RequestParam(name = "email", required = false) final String email) {
        return ResponseEntity.ok(userService.findTop20ByUsernameContainingOrEmailContaining(username, email));
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
}
