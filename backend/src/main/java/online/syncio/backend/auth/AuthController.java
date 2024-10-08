package online.syncio.backend.auth;

import com.google.zxing.WriterException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import online.syncio.backend.auth.request.ForgotPasswordForm;
import online.syncio.backend.auth.request.RefreshTokenDTO;
import online.syncio.backend.auth.request.RegisterDTO;
import online.syncio.backend.auth.request.UserLoginDTO;
import online.syncio.backend.auth.responses.AuthResponse;
import online.syncio.backend.auth.responses.LoginResponse;
import online.syncio.backend.auth.responses.RegisterResponse;
import online.syncio.backend.auth.responses.ResponseObject;
import online.syncio.backend.exception.DataNotFoundException;
import online.syncio.backend.setting.SettingService;
import online.syncio.backend.user.User;
import online.syncio.backend.utils.CustomerForgetPasswordUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("${api.prefix}/users")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final TokenService tokenService;
    private final TokenRepository tokenRepository;
    private final SettingService settingService;
    private final MessageSource messageSource;

    @Value("${apiPrefix.client}")
    private String apiPrefix;


    @Value("${url.frontend}")
    private String urlFE;

    /**
     * Register a new user
     * @param registerDTO
     * @return
     */
    @PostMapping("/register")
    public ResponseEntity<ResponseObject> createUser(
            @Valid @RequestBody RegisterDTO registerDTO
    ) throws Exception {

        User user = authService.createUser(registerDTO);
        String message = messageSource.getMessage("user.register.verify.account", null, LocaleContextHolder.getLocale());
        return ResponseEntity.ok(ResponseObject.builder()
                .status(HttpStatus.CREATED)
                .data(RegisterResponse.fromUser(user))
                .message(message)
                .build());
    }



    @PostMapping("/login")
    public ResponseEntity<ResponseObject> login(
            @Valid @RequestBody UserLoginDTO userLoginDTO,
            HttpServletRequest request
    ) throws Exception {
        // Kiểm tra thông tin đăng nhập và sinh token
        String token = authService.login(
                userLoginDTO.getEmailOrUsername(),
                userLoginDTO.getPassword()
        );

        String userAgent = request.getHeader("User-Agent");
        User userDetail = authService.getUserDetailsFromToken(token);
        Token jwtToken = tokenService.addToken(userDetail, token, isMobileDevice(userAgent));

        String message = messageSource.getMessage("user.login.success", null, request.getLocale());

        LoginResponse loginResponse = LoginResponse
                .builder()
                .message(message)
                .token(jwtToken.getToken())
                .bio(userDetail.getBio())
                .tokenType(jwtToken.getTokenType())
                .refreshToken(jwtToken.getRefreshToken())
                .username(userDetail.getUsername())
                .roles(userDetail.getAuthorities().stream().map(GrantedAuthority::getAuthority).toList())
                .id(userDetail.getId())
                .build();
        return ResponseEntity.ok().body(ResponseObject.builder()
                .message(message)
                .data(loginResponse)
                .status(HttpStatus.OK)
                .build());
    }
    
    @PostMapping("/refreshToken")
    public ResponseEntity<ResponseObject> refreshToken(
            @Valid @RequestBody RefreshTokenDTO refreshTokenDTO
    ) throws Exception {
        User userDetail = authService.getUserDetailsFromRefreshToken(refreshTokenDTO.getRefreshToken());
        Token jwtToken = tokenService.refreshToken(refreshTokenDTO.getRefreshToken(), userDetail);
        LoginResponse loginResponse = LoginResponse.builder()
                .message("Refresh token successfully")
                .token(jwtToken.getToken())
                .tokenType(jwtToken.getTokenType())
                .refreshToken(jwtToken.getRefreshToken())
                .username(userDetail.getUsername())
                .roles(userDetail.getAuthorities().stream().map(item -> item.getAuthority()).toList())
                .id(userDetail.getId()).build();
        return ResponseEntity.ok().body(
                ResponseObject.builder()
                        .data(loginResponse)
                        .message(loginResponse.getMessage())
                        .status(HttpStatus.OK)
                        .build());

    }
    private boolean isMobileDevice(String userAgent) {
        return userAgent.toLowerCase().contains("mobile");
    }

    @PostMapping("/details")
    public ResponseEntity<AuthResponse> getUserDetails(
            @RequestHeader("Authorization") String authorizationHeader
    ) {
        try {
            String extractedToken = authorizationHeader.substring(7);
            User user = authService.getUserDetailsFromToken(extractedToken);
            return ResponseEntity.ok(AuthResponse.fromUser(user));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }


    @PostMapping(value = "/forgot_password")
    public ResponseEntity<?> forgotPassword(HttpServletRequest request,@Valid @RequestBody ForgotPasswordForm forgotPasswordForm) throws Exception {


//        if (!authService.existsByEmail(forgotPasswordForm.getEmail())) {
//            return new ResponseEntity<>(new DataNotFoundException("User not exist"), HttpStatus.BAD_REQUEST);
//        }

        String token = authService.updateResetPasswordToken(forgotPasswordForm.getEmail());
        String link = urlFE + "reset_password?token=" + token;

        CustomerForgetPasswordUtil.sendEmail(link, forgotPasswordForm.getEmail(), settingService);


        return  ResponseEntity.ok(ResponseObject.builder()
                .message("Reset password link has been sent to your email")
                .data("")
                .status(HttpStatus.OK)
                .build());
    }

    @PostMapping(value = "/reset_password")
    public ResponseEntity<?> processResetPassword(@RequestParam(value = "token", required = true) String token,
                                                  @RequestParam(value = "password", required = true) String password) throws Exception {

        authService.updatePassword(token, password);

        return  ResponseEntity.ok(
                ResponseObject.builder()
                        .message("Password updated successfully")
                        .data("")
                        .status(HttpStatus.OK)
                        .build()
        );
    }


    @PostMapping("/confirm-user-register")
    public ResponseEntity<?> confirm(@RequestParam("token") String token) throws IOException, WriterException {
        tokenService.confirmToken(token);
        String message = messageSource.getMessage("user.confirmed.success", null, LocaleContextHolder.getLocale());
        return ResponseEntity.ok(
                    ResponseObject.builder()
                            .message(message)
                            .data("")
                            .status(HttpStatus.OK)
                            .build()
                );


    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {

            return ResponseEntity.badRequest().body("Invalid Authorization header format.");
        }


        final String jwt = authHeader.substring(7);

        var storedToken = tokenRepository.findByToken(jwt);

        if (storedToken != null) {
            storedToken.setExpired(true);
            storedToken.setRevoked(true);
            tokenRepository.save(storedToken);

            SecurityContextHolder.clearContext();

            return ResponseEntity.ok(
                    ResponseObject.builder()
                            .message("Logout successfully")
                            .data("")
                            .status(HttpStatus.OK)
                            .build()
            );
        }

        return ResponseEntity.notFound().build();
    }

    @PutMapping("/avatar")
    public ResponseEntity<?> updateAvatar(@RequestParam("file") MultipartFile file) {
        try {
            authService.updateAvatar(file);
            return ResponseEntity.ok("Success");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }


    @PostMapping("/resend-email")
    public ResponseEntity<Void> resendRegistrationEmail(@RequestParam String email) throws Exception {
        authService.resendRegistrationEmail(email);
        return ResponseEntity.ok().build();
    }


    @PostMapping("/change-password")
    public ResponseEntity<Boolean> changePassword(@RequestBody Map<String, String> passwordMap) {
        String oldPassword = passwordMap.get("oldPassword");
        String newPassword = passwordMap.get("newPassword");
        final Boolean isSuccess = authService.changePassword(oldPassword, newPassword);
        return ResponseEntity.ok(isSuccess);
    }


}
