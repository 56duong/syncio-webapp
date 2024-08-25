package online.syncio.backend.auth;

import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import online.syncio.backend.auth.request.RegisterDTO;
import online.syncio.backend.exception.*;
import online.syncio.backend.setting.SettingService;
import online.syncio.backend.user.RoleEnum;
import online.syncio.backend.user.StatusEnum;
import online.syncio.backend.user.User;
import online.syncio.backend.user.UserRepository;
import online.syncio.backend.utils.AuthUtils;
import online.syncio.backend.utils.CustomerForgetPasswordUtil;
import online.syncio.backend.utils.CustomerRegisterUtil;
import online.syncio.backend.utils.JwtTokenUtils;
import org.modelmapper.internal.bytebuddy.utility.RandomString;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.UnsupportedEncodingException;
import java.time.LocalDateTime;
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
    private final SettingService settingService;
    private final MessageSource messageSource;
    private final AuthUtils authUtils;

    @Value("${url.frontend}")
    private String urlFE;
    public Boolean existsByEmail(String email) {
        // TODO Auto-generated method stub
        return userRepository.existsByEmail(email);
    }
    public UUID getCurrentLoggedInUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if(authentication == null || !authentication.isAuthenticated() || authentication instanceof AnonymousAuthenticationToken) {
            return null;
        }
        User user = (User) authentication.getPrincipal();
        return user.getId();
    }

    @Transactional
    public User createUser(RegisterDTO userDTO) throws Exception {
        // Check if the email already exists
        String email = userDTO.getEmail();
        if( userRepository.existsByEmail(email)) {
            String message = messageSource.getMessage("user.register.email.exist", null, LocaleContextHolder.getLocale());
            throw new AppException(HttpStatus.CONFLICT, message, null);
        }
        String username = userDTO.getUsername();
        if( userRepository.existsByUsername(username)) {
            String message = messageSource.getMessage("user.register.username.exist", null, LocaleContextHolder.getLocale());
            throw new AppException(HttpStatus.CONFLICT, message, null);
        }
        if (!userDTO.getPassword().equals(userDTO.getRetypePassword())) {
            String message = messageSource.getMessage("user.register.password.not.match", null, LocaleContextHolder.getLocale());
            throw new AppException(HttpStatus.BAD_REQUEST, message, null);
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
                .expirationDate(LocalDateTime.now().plusMinutes(1)) //30 minutes
                .revoked(false)
                .build();

        tokenRepository.save(confirmationToken);
        String link = urlFE + "confirm-user-register?token=" + token;
        CustomerForgetPasswordUtil.sendEmailTokenRegister(link, email, settingService);
        return newUser;
    }



    public String login(
            String emailOrUsername,
            String password
    ) throws Exception {
        Optional<User> optionalUser = Optional.empty();
        String subject = null;
        if(emailOrUsername != null) {
            if(emailOrUsername.contains("@")) {
                optionalUser = userRepository.findByEmail(emailOrUsername);
            } else {
                optionalUser = userRepository.findByUsername(emailOrUsername);
            }
        }

        String message = messageSource.getMessage("user.login.failed", null, LocaleContextHolder.getLocale());
        if(optionalUser.isEmpty()) {
            throw new DataNotFoundException(message);
        }

        subject = optionalUser.get().getEmail();

        User existingUser = optionalUser.get();

        if(!passwordEncoder.matches(password, existingUser.getPassword())) {
            throw new BadCredentialsException(message);
        }

        if(!optionalUser.get().getStatus().equals(StatusEnum.ACTIVE)) {
            String messageStatus = messageSource.getMessage("user.login.need.verify", null, LocaleContextHolder.getLocale());
            throw new DataNotFoundException(messageStatus);
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

        String email = jwtTokenUtil.extractEmail(token);
        Optional<User> user = userRepository.findByEmail(email);

        if (user.isPresent()) {
            return user.get();
        } else {
            throw new Exception("User not found");
        }
    }

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
            if(!user.getStatus().equals(StatusEnum.ACTIVE)) {
                throw new DataNotFoundException("User is not active, please contact admin for more information");
            }
            String token = RandomString.make(30);

            user.setResetPasswordToken(token);
            userRepository.save(user);

            return token;

    }

    public void updatePassword(String token, String newPassword) throws Exception {
        User customer = userRepository.findByResetPasswordToken(token);
        if (customer == null) {
            throw new Exception("No customer found: invalid token");
        }

        customer.setPassword(newPassword);
        customer.setResetPasswordToken(null);
        customer.setStatus(StatusEnum.ACTIVE);
        CustomerRegisterUtil.encodePassword(customer, passwordEncoder);

        userRepository.save(customer);
    }
    public void updateAvatar(MultipartFile file) throws DataNotFoundException {
        //      Upload S3 AWS
    }

    public void resendRegistrationEmail(String email) throws DataNotFoundException, MessagingException, UnsupportedEncodingException {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new DataNotFoundException("User not found"));
        String token = UUID.randomUUID().toString();
        Token confirmationToken = Token.builder()
                .token(token)
                .user(user)
                .expirationDate(LocalDateTime.now().plusMinutes(1))
                .revoked(false)
                .build();

        tokenRepository.save(confirmationToken);
        String link = urlFE + "confirm-user-register?token=" + token;
        CustomerForgetPasswordUtil.sendEmailTokenRegister(link, email, settingService);
    }


    public Boolean changePassword(final String oldPassword, final String newPassword) {
        final UUID currentUserId = authUtils.getCurrentLoggedInUserId();
        final User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new NotFoundException(User.class, "id", currentUserId.toString()));

        if (passwordEncoder.matches(oldPassword, user.getPassword())) {
            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);
            return true;
        }
        else {
            throw new AppException(HttpStatus.FORBIDDEN, "Old password is incorrect", null);
        }
    }

}
