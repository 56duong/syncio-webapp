package online.syncio.backend.user;

import com.google.zxing.WriterException;
import jakarta.validation.Valid;
import online.syncio.backend.auth.responses.AuthResponse;
import online.syncio.backend.exception.AppException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;

@RestController
@RequestMapping(value = "${api.prefix}/users")
public class UserController {

    private final UserService userService;
    private final UserRedisService userRedisService;


    public UserController (final UserService userService, PasswordEncoder passwordEncoder, UserRedisService userRedisService) {
        this.userService = userService;
        this.userRedisService = userRedisService;
    }


    @GetMapping
    public ResponseEntity<List<UserDTO>> searchUsers (@RequestParam Optional<String> username) {
        List<UserDTO> users;

        // Attempt to get cached data if username is specified
        if (username.isPresent()) {
            users = userRedisService.getCachedUsers(username.get());
            if (users != null) {
                return ResponseEntity.ok(users);
            }
        }

        // Fetch from the database and cache the result if username is specified
        users = userService.findAll(username);
        if (username.isPresent() && !users.isEmpty()) {
            userRedisService.cacheUsers(username.get(), users);
        }

        return ResponseEntity.ok(users);
    }

    @GetMapping("/search-by-username")
    public ResponseEntity<List<UserProfile>> searchUsersByUsername (@RequestParam Optional<String> username) {
        return ResponseEntity.ok(userService.searchUsers(username));
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
    public ResponseEntity<List<UserSearchDTO>> searchUsers (@RequestParam(name = "username", required = false) final String username,
                                                      @RequestParam(name = "email", required = false) final String email) {
        return ResponseEntity.ok(userService.findTop20ByUsernameContainingOrEmailContaining(username, email));
    }

    @PostMapping
    public ResponseEntity<UUID> createUser (@RequestBody @Valid final UserDTO userDTO) throws IOException, WriterException {
        if (userRedisService.usernameExists(userDTO.getUsername())) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Username already exists!", null);
        }
        if (userRedisService.emailExists(userDTO.getEmail())) {

            throw new AppException(HttpStatus.BAD_REQUEST, "Email already exists!", null);
        }

        return ResponseEntity.ok(userService.create(userDTO));
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


    @GetMapping("/profile/{id}")
    public ResponseEntity<UserProfile> getUserProfile (@PathVariable(name = "id") final UUID id) {
        return ResponseEntity.ok(userService.getUserProfile(id));
    }

    @GetMapping("/profile-test/{id}")
    public ResponseEntity<UserProfile> getUserProfileNotUseCache (@PathVariable(name = "id") final UUID id) {
        return ResponseEntity.ok(userService.getUserProfileNotUseCache(id));
    }

    @PutMapping("/update-profile/{id}")
    public ResponseEntity<AuthResponse> updateProfile(@PathVariable(name = "id") final UUID id, @RequestBody @Valid UpdateProfileDTO user) {
        final AuthResponse userDetail = userService.updateProfile(id, user);
        return ResponseEntity.ok(userDetail);
    }

    @PostMapping("/update-avatar")
    public ResponseEntity<Void> updateAvatar(@RequestParam("file") MultipartFile file) {
        userService.updateAvatar(file);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/last/{days}")
    public Map<String, Long> getNewUsersLastNDays(@PathVariable(name = "days") final int days) {
        return userService.getNewUsersLastNDays(days);
    }

    @GetMapping("/generateUserQRCode/{userId}")
    public String generateUserQRCode(@PathVariable UUID userId) throws WriterException, IOException {
        String qrCodeText = userId.toString();
        String qrCodeUrl = userService.generateQRCodeAndUploadToFirebase(qrCodeText, 300, 300);

        userService.saveQRcode(qrCodeUrl,userId);

        return "QR code generated and saved at " + qrCodeUrl;
    }

    //getQrcode
    @GetMapping("/getQrcode/{userId}")
    public String getQrcode(@PathVariable UUID userId) {
        return userService.getQrcode(userId);
    }


    @GetMapping("/username/{username}")
    public ResponseEntity<Map<String, UUID>> getUserIdByUsername (@PathVariable(name = "username") final String username) {
        final UUID userId = userService.getUserIdByUsername(username);
        return ResponseEntity.ok(Collections.singletonMap("userId", userId));
    }


    @GetMapping("/check-status/{id}")
    public ResponseEntity<Map<String, String>> checkUserStatusById(@PathVariable(name = "id") final UUID id) {
        final String status = userService.checkUserStatusById(id);
        return ResponseEntity.ok(Collections.singletonMap("status", status));
    }


    @GetMapping("/count")
    public ResponseEntity<Long> countUsers() {
        return ResponseEntity.ok(userService.countUsers());
    }

}
