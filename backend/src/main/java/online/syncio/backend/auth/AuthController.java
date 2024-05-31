package online.syncio.backend.auth;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import online.syncio.backend.auth.request.*;
import online.syncio.backend.auth.responses.AuthResponse;
import online.syncio.backend.auth.responses.LoginResponse;
import online.syncio.backend.auth.responses.ResponseObject;

import online.syncio.backend.config.LocalizationUtils;
import online.syncio.backend.exception.DataNotFoundException;
import online.syncio.backend.exception.InvalidParamException;
import online.syncio.backend.setting.SettingService;
import online.syncio.backend.user.User;
import online.syncio.backend.user.UserService;
import online.syncio.backend.auth.responses.RegisterResponse;
import online.syncio.backend.utils.CustomerForgetPasswordUtil;
import online.syncio.backend.utils.MessageKeys;
//import online.syncio.backend.utils.RabbitMQUtils;
import online.syncio.backend.utils.ValidationUtils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("${api.prefix}/users")
@RequiredArgsConstructor
public class AuthController {
    private final LocalizationUtils localizationUtils;
    private final AuthService authService;
    private final TokenService tokenService;
    @Autowired
    SettingService settingService;
    @Value("${apiPrefix.client}")
    private String apiPrefix;
//    private final RabbitTemplate rabbitTemplate;
//    private final RabbitMQUtils rabbitMQService;
    /**
     * Register a new user
     * @param registerDTO
     * @param result
     * @return
     */
    @PostMapping("/register")
    public ResponseEntity<ResponseObject> createUser(
            @Valid @RequestBody RegisterDTO registerDTO,
            BindingResult result
    ) throws Exception {


        if (result.hasErrors()) {
            List<String> errorMessages = result.getFieldErrors()
                    .stream()
                    .map(FieldError::getDefaultMessage)
                    .toList();


            return ResponseEntity.badRequest().body(ResponseObject.builder()
                    .status(HttpStatus.BAD_REQUEST)
                    .data(null)
                    .message(errorMessages.toString())
                    .build());
        }
        if(registerDTO.getEmail() == null || registerDTO.getEmail().trim().isBlank()) {
           return ResponseEntity.badRequest().body(ResponseObject.builder()
                    .status(HttpStatus.BAD_REQUEST)
                    .data(null)
                    .message(localizationUtils.getLocalizedMessage(MessageKeys.EMAIL_REQUIRED))
                    .build());
        }

        if (!registerDTO.getPassword().equals(registerDTO.getRetypePassword())) {


            return ResponseEntity.badRequest().body(ResponseObject.builder()
                    .status(HttpStatus.BAD_REQUEST)
                    .data(null)
                    .message(localizationUtils.getLocalizedMessage(MessageKeys.PASSWORD_NOT_MATCH))
                    .build());
        } else{
            if(!ValidationUtils.isValidEmail(registerDTO.getEmail())){
                throw new Exception("Email không hợp lệ");
            }
        }
        User user = authService.createUser(registerDTO);
//        rabbitMQService.sendMessage("New user registered: " + user.getEmail());
        return ResponseEntity.ok(ResponseObject.builder()
                .status(HttpStatus.CREATED)
                .data(RegisterResponse.fromUser(user))
                .message("Đăng ký tài khoản thành công")
                .build());
    }

    @PostMapping("/login")
    public ResponseEntity<ResponseObject> login(
            @Valid @RequestBody UserLoginDTO userLoginDTO,
            HttpServletRequest request
    ) throws Exception {
        // Kiểm tra thông tin đăng nhập và sinh token
        String token = authService.login(
                userLoginDTO.getEmail(),
                userLoginDTO.getPassword(),
                userLoginDTO.getRoleId() == null ? 1 : userLoginDTO.getRoleId()
        );
        String userAgent = request.getHeader("User-Agent");
        User userDetail = authService.getUserDetailsFromToken(token);
        Token jwtToken = tokenService.addToken(userDetail, token, isMobileDevice(userAgent));

        LoginResponse loginResponse = LoginResponse.builder()
                .message("Login successfully")
                .token(jwtToken.getToken())
                .tokenType(jwtToken.getTokenType())
                .refreshToken(jwtToken.getRefreshToken())
                .username(userDetail.getUsername())
                .roles(userDetail.getAuthorities().stream().map(item -> item.getAuthority()).toList())
                .id(userDetail.getId())
                .build();
        return ResponseEntity.ok().body(ResponseObject.builder()
                .message("Login successfully")
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
//    @PreAuthorize("hasRole('ROLE_ADMIN') or hasRole('ROLE_USER')")
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

    @PutMapping("/reset-password/{userId}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<ResponseObject> resetPassword(@Valid @PathVariable UUID userId){
        try {
            String newPassword = UUID.randomUUID().toString().substring(0, 5); // Tạo mật khẩu mới
            authService.resetPassword(userId, newPassword);
            return ResponseEntity.ok(ResponseObject.builder()
                    .message("Reset password successfully")
                    .data(newPassword)
                    .status(HttpStatus.OK)
                    .build());
        } catch (InvalidParamException e) {
            return ResponseEntity.ok(ResponseObject.builder()
                    .message("Invalid password")
                    .data("")
                    .status(HttpStatus.BAD_REQUEST)
                    .build());
        } catch (DataNotFoundException e) {
            return ResponseEntity.ok(ResponseObject.builder()
                    .message("User not found")
                    .data("")
                    .status(HttpStatus.BAD_REQUEST)
                    .build());
        }
    }

    @RequestMapping(value = "api/users/logoutDummy")
    @PreAuthorize("permitAll()")
    @ResponseStatus(HttpStatus.OK)
    public void logout() {

    }


    @PostMapping(value = "/forgot_password")
    public ResponseEntity<?> forgotPassword(HttpServletRequest request,@Valid @RequestBody ForgotPasswordForm forgotPasswordForm) throws Exception {


        if (!authService.existsByEmail(forgotPasswordForm.getEmail())) {
            return new ResponseEntity<>(new DataNotFoundException("User not exist"), HttpStatus.BAD_REQUEST);
        }
        String token = authService.updateResetPasswordToken(forgotPasswordForm.getEmail());
        String link = "http://localhost:4200/reset_password?token=" + token;

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
}
