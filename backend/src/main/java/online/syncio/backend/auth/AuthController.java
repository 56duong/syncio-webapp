package online.syncio.backend.auth;

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
import online.syncio.backend.exception.ExpiredTokenException;
import online.syncio.backend.exception.InvalidParamException;

import online.syncio.backend.setting.SettingService;
import online.syncio.backend.user.RoleEnum;
import online.syncio.backend.user.StatusEnum;
import online.syncio.backend.user.User;
import online.syncio.backend.user.UserRepository;
import online.syncio.backend.auth.request.RegisterDTO;
import online.syncio.backend.utils.ConstantsMessage;
import online.syncio.backend.utils.CustomerForgetPasswordUtil;
import online.syncio.backend.utils.CustomerRegisterUtil;
import online.syncio.backend.utils.JwtTokenUtils;



import online.syncio.backend.utils.ValidationUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RequiredArgsConstructor
@Service
public class AuthService {
    private final UserRepository userRepository;

    private final TokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenUtils jwtTokenUtil;
    private final AuthenticationManager authenticationManager;
    private final  TokenService tokenService;
    private final SettingService settingService;
    @Value("${url.frontend}")
    private String urlFE;
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


        User user = authService.createUser(registerDTO);

//        rabbitMQService.sendMessage("New user registered: " + user.getEmail());
        return ResponseEntity.ok(ResponseObject.builder()
                .status(HttpStatus.CREATED)
                .data(RegisterResponse.fromUser(user))
                .message("Vui lòng xác thực tài khoản qua Email")
                .build());
    }

    @Transactional
    public User createUser(RegisterDTO userDTO) throws Exception {
        // Check if the email already exists
        String email = userDTO.getEmail();
        if(!email.isBlank() && userRepository.existsByEmail(email)) {
            throw new DataIntegrityViolationException("Email đã tồn tại");
        }


        String encodedPassword = passwordEncoder.encode(userDTO.getPassword());
        User newUser = User.builder()
                .email(userDTO.getEmail())
                .password(encodedPassword)
                .username(userDTO.getUsername())
                .status(StatusEnum.DISABLED)
                .role(RoleEnum.USER)
                .build();

        newUser = userRepository.save(newUser);

        String token = UUID.randomUUID().toString();
        Token confirmationToken = Token.builder()
                .token(token)
                .user(newUser)
                .expirationDate(LocalDateTime.now().plusMinutes(30)) //30 minutes
                .revoked(false)
                .build();

        tokenRepository.save(confirmationToken);
        String link = urlFE + "/confirm-user-register?token=" + token;
        CustomerForgetPasswordUtil.sendEmailTokenRegister(link, email, settingService);
        return newUser;
    }



    public String login(
            String email,
            String password
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

        if(optionalUser.isEmpty()) {
            throw new DataNotFoundException(ConstantsMessage.USER_NOT_FOUND);
        }

        User existingUser = optionalUser.get();


        if(!passwordEncoder.matches(password, existingUser.getPassword())) {
            throw new BadCredentialsException(ConstantsMessage.PASSWORD_NOT_MATCH);

        }

        if(!optionalUser.get().getStatus().equals(StatusEnum.ACTIVE)) {
            throw new DataNotFoundException(ConstantsMessage.USER_IS_LOCKED);
        }
        UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
                subject, password,
                existingUser.getAuthorities()
        );

        //authenticate with Java Spring security
        authenticationManager.authenticate(authenticationToken);
        return jwtTokenUtil.generateToken(existingUser);
    }

    public User getUserDetailsFromToken(String token) throws Exception {
        if(jwtTokenUtil.isTokenExpired(token)) {
            throw new ExpiredTokenException("Token is expired");
        }
        System.out.println("Token: " + token);
        String email = jwtTokenUtil.extractEmail(token);
        Optional<User> user = userRepository.findByEmail(email);

    @PostMapping("/confirm-user-register")
    public ResponseEntity<?> confirm(@RequestParam("token") String token) {
        tokenService.confirmToken(token);
        return  ResponseEntity.ok(
                ResponseObject.builder()
                        .message("User confirmed successfully")
                        .data("")
                        .status(HttpStatus.OK)
                        .build())  ;

    public User getUserDetailsFromRefreshToken(String refreshToken) throws Exception {
        Token existingToken = tokenRepository.findByRefreshToken(refreshToken);
        return getUserDetailsFromToken(existingToken.getToken());
    }
    @Transactional
    public void resetPassword(UUID userId, String newPassword) throws InvalidParamException,DataNotFoundException {
        User existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new DataNotFoundException("User not found"));

        existingUser.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(existingUser);

        List<Token> tokens = tokenRepository.findByUser(existingUser);
        for(Token token : tokens) {
            tokenRepository.delete(token);
        }
    }
    public String updateResetPasswordToken(String email) throws Exception {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new DataNotFoundException("User not found"));;

        String token = RandomString.make(30);

        user.setResetPasswordToken(token);
        userRepository.save(user);

        return token;

    }
}