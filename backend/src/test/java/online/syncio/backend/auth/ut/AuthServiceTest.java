package online.syncio.backend.auth.ut;

import online.syncio.backend.auth.AuthService;
import online.syncio.backend.auth.TokenRepository;
import online.syncio.backend.auth.TokenService;
import online.syncio.backend.auth.request.RegisterDTO;
import online.syncio.backend.exception.AppException;
import online.syncio.backend.setting.SettingRepository;
import online.syncio.backend.setting.SettingService;
import online.syncio.backend.user.RoleEnum;
import online.syncio.backend.user.StatusEnum;
import online.syncio.backend.user.User;
import online.syncio.backend.user.UserRepository;
import online.syncio.backend.utils.JwtTokenUtils;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Locale;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

class AuthServiceTest {
    @Mock
    UserRepository userRepository;
    @Mock
    TokenRepository tokenRepository;
    @Mock
    PasswordEncoder passwordEncoder;
    @Mock
    JwtTokenUtils jwtTokenUtil;
    @Mock
    AuthenticationManager authenticationManager;
    @Mock
    TokenService tokenService;
    @Mock
    SettingService settingService;
    @Mock
    SettingRepository settingRepo;
    @Mock
    MessageSource messageSource;
    @InjectMocks
    AuthService authService;

    @BeforeEach
    void setUp () {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testCreateUser () throws Exception {
        RegisterDTO register = getRegisterDTO();
        User expected = getTestUser();

        when(userRepository.existsByEmail("johndoe@gmail.com")).thenReturn(false);
        when(userRepository.existsByUsername("johndoe")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenReturn(expected);
        when(passwordEncoder.encode("123456")).thenReturn("encodedPassword");
        when(messageSource.getMessage(anyString(), any(Object[].class), any(Locale.class))).thenReturn("getMessageResponse");

        User result = authService.createUser(register);
        assertEquals(expected, result);
    }

    @Test
    void testCreateUser_Fail () throws Exception {
        RegisterDTO register = getRegisterDTO();
        User expected = getTestUser();
        User unexpected = getTestUser2();

        when(userRepository.existsByEmail("johndoe@gmail.com")).thenReturn(false);
        when(userRepository.existsByUsername("johndoe")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenReturn(expected);
        when(passwordEncoder.encode("123456")).thenReturn("encodedPassword");
        when(messageSource.getMessage(anyString(), any(Object[].class), any(Locale.class))).thenReturn("getMessageResponse");

        User result = authService.createUser(register);
        Assertions.assertNotEquals(unexpected, result);
    }

    @Test
    void testCreateUserUsernameAlreadyExists () {
        RegisterDTO register = getRegisterDTO();

        when(userRepository.existsByUsername("johndoe")).thenReturn(true);
        when(messageSource.getMessage(eq("user.register.username.exist"), isNull(), any(Locale.class))).thenReturn("Username existed");
        String message = messageSource.getMessage("user.register.username.exist", null, LocaleContextHolder.getLocale());

        AppException exception = assertThrows(AppException.class, () -> {
            authService.createUser(register);
        });

        assertEquals(message, exception.getMessage());
    }

    @Test
    void testCreateUser_EmailAlreadyExists () {
        RegisterDTO register = getRegisterDTO();

        when(userRepository.existsByEmail("johndoe@gmail.com")).thenReturn(true);
        when(messageSource.getMessage(eq("user.register.email.exist"), isNull(), any(Locale.class))).thenReturn("Email existed");
        String message = messageSource.getMessage("user.register.email.exist", null, LocaleContextHolder.getLocale());

        AppException exception = assertThrows(AppException.class, () -> {
            authService.createUser(register);
        });

        assertEquals(message, exception.getMessage());
    }


//    @Test
//    void testLogin () throws Exception {
//        when(userRepository.findByEmail(anyString())).thenReturn(null);
//        when(userRepository.findByUsername(anyString())).thenReturn(null);
//        when(passwordEncoder.matches(any(CharSequence.class), anyString())).thenReturn(true);
//        when(jwtTokenUtil.generateToken(any(User.class))).thenReturn("generateTokenResponse");
//        when(authenticationManager.authenticate(any(Authentication.class))).thenReturn(null);
//        when(messageSource.getMessage(anyString(), any(Object[].class), any(Locale.class))).thenReturn("getMessageResponse");
//
//        String result = authService.login("emailOrUsername", "password");
//        Assertions.assertEquals("replaceMeWithExpectedResult", result);
//    }
//
//
//    @Test
//    void testResetPassword () {
//        when(userRepository.save(any(S.class))).thenReturn(new S());
//        when(userRepository.findById(any(ID.class))).thenReturn(null);
//        when(tokenRepository.findByUser(any(User.class))).thenReturn(List.of(new Token(Long.valueOf(1), "token", "refreshToken", "tokenType", LocalDateTime.of(2024, Month.AUGUST, 4, 16, 22, 37), LocalDateTime.of(2024, Month.AUGUST, 4, 16, 22, 37), true, true, new User(new UUID(0L, 0L), "email", "username", "password", "coverURL", "bio", LocalDateTime.of(2024, Month.AUGUST, 4, 16, 22, 37), RoleEnum.ADMIN, StatusEnum.ACTIVE, "resetPasswordToken", Set.of(new Post()), "interestKeywords", Set.of(new UserFollow()), Set.of(new UserFollow()), Set.of(new UserCloseFriend()), Set.of(new UserCloseFriend()), Set.of(new Like()), Set.of(new Comment()), Set.of(new CommentLike()), Set.of(new Report()), Set.of(new MessageRoomMember()), Set.of(new MessageContent()), Set.of(new Story()), Set.of(new StoryView()), Set.of(new Notification()), Set.of(new Notification()), Set.of(new Billing()), Set.of(new Billing()), "qrCodeUrl", LocalDateTime.of(2024, Month.AUGUST, 4, 16, 22, 37), new UserSetting(), Set.of(new PostCollection())))));
//        when(tokenRepository.save(any(S.class))).thenReturn(new S());
//        when(tokenRepository.findById(any(ID.class))).thenReturn(null);
//        when(passwordEncoder.encode(any(CharSequence.class))).thenReturn("encodeResponse");
//
//        authService.resetPassword(new UUID(0L, 0L), "newPassword");
//        verify(userRepository).delete(any(T.class));
//        verify(tokenRepository).delete(any(T.class));
//    }
//
//    @Test
//    void testUpdateResetPasswordToken () {
//        when(userRepository.findByEmail(anyString())).thenReturn(null);
//        when(userRepository.save(any(S.class))).thenReturn(new S());
//        when(tokenRepository.save(any(S.class))).thenReturn(new S());
//
//        String result = authService.updateResetPasswordToken("email");
//        Assertions.assertEquals("replaceMeWithExpectedResult", result);
//    }
//
//    @Test
//    void testUpdatePassword () {
//        when(userRepository.findByResetPasswordToken(anyString())).thenReturn(new User(new UUID(0L, 0L), "email", "username", "password", "coverURL", "bio", LocalDateTime.of(2024, Month.AUGUST, 4, 16, 22, 37), RoleEnum.ADMIN, StatusEnum.ACTIVE, "resetPasswordToken", Set.of(new Post()), "interestKeywords", Set.of(new UserFollow()), Set.of(new UserFollow()), Set.of(new UserCloseFriend()), Set.of(new UserCloseFriend()), Set.of(new Like()), Set.of(new Comment()), Set.of(new CommentLike()), Set.of(new Report()), Set.of(new MessageRoomMember()), Set.of(new MessageContent()), Set.of(new Story()), Set.of(new StoryView()), Set.of(new Notification()), Set.of(new Notification()), Set.of(new Billing()), Set.of(new Billing()), "qrCodeUrl", LocalDateTime.of(2024, Month.AUGUST, 4, 16, 22, 37), new UserSetting(), Set.of(new PostCollection())));
//        when(userRepository.save(any(S.class))).thenReturn(new S());
//        when(tokenRepository.save(any(S.class))).thenReturn(new S());
//
//        authService.updatePassword("token", "newPassword");
//    }
//
//    @Test
//    void testUpdateAvatar () {
//        authService.updateAvatar(null);
//    }

    User getTestUser () {
        return User.builder()
                   .email("johndoe@gmail.com")
                   .username("johndoe")
                   .password("encodedPassword")
                   .role(RoleEnum.USER)
                   .status(StatusEnum.ACTIVE)
                   .build();
    }

    RegisterDTO getRegisterDTO () {
        return RegisterDTO.builder()
                          .email("johndoe@gmail.com")
                          .username("johndoe")
                          .password("123456")
                          .retypePassword("123456")
                          .build();
    }

    User getTestUser2 () {
        return User.builder()
                   .email("harryporter@gmail.com")
                   .username("harryporter")
                   .password("encodedPassword22")
                   .role(RoleEnum.USER)
                   .status(StatusEnum.ACTIVE)
                   .build();
    }

    RegisterDTO getRegisterDTO2 () {
        return RegisterDTO.builder()
                          .email("harryporter@gmail.com")
                          .username("harryporter")
                          .password("123456")
                          .retypePassword("123456")
                          .build();
    }


}