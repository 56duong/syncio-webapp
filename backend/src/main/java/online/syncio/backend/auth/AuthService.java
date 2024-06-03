package online.syncio.backend.auth;

import lombok.RequiredArgsConstructor;

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

import org.modelmapper.internal.bytebuddy.utility.RandomString;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    private final  TokenService tokenService;
    private final SettingService settingService;
    @Value("${url.frontend}")
    private String urlFE;
    public Boolean existsByEmail(String email) {
        // TODO Auto-generated method stub
        return userRepository.existsByEmail(email);
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
        Optional<User> optionalUser = Optional.empty();
        String subject = null;
        if(optionalUser.isEmpty() && email != null) {
            optionalUser =   userRepository.findByEmail(email);
            subject = email;
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

}
