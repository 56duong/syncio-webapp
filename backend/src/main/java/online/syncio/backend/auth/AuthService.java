package online.syncio.backend.auth;

import lombok.RequiredArgsConstructor;
import online.syncio.backend.auth.request.RegisterDTO;
import online.syncio.backend.config.LocalizationUtils;
import online.syncio.backend.exception.DataNotFoundException;
import online.syncio.backend.exception.ExpiredTokenException;
import online.syncio.backend.exception.InvalidParamException;
import online.syncio.backend.exception.PermissionDenyException;
import online.syncio.backend.user.RoleEnum;
import online.syncio.backend.user.StatusEnum;
import online.syncio.backend.user.User;
import online.syncio.backend.user.UserRepository;
import online.syncio.backend.utils.CustomerRegisterUtil;
import online.syncio.backend.utils.JwtTokenUtils;
import online.syncio.backend.utils.MessageKeys;
import org.modelmapper.internal.bytebuddy.utility.RandomString;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RequiredArgsConstructor
@Service
public class AuthService {
    private final UserRepository userRepository;
    private final LocalizationUtils localizationUtils;
    private final TokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenUtils jwtTokenUtil;
    private final AuthenticationManager authenticationManager;

    public Boolean existsByEmail(String email) {
        // TODO Auto-generated method stub
        return userRepository.existsByEmail(email);
    }

    @Transactional
    public User createUser(RegisterDTO userDTO) throws Exception {
        //register user
        String email = userDTO.getEmail();

        if(!email.isBlank() && userRepository.existsByEmail(email)) {
            throw new DataIntegrityViolationException("Email đã tồn tại");
        }

        RoleEnum role = RoleEnum.findByName(userDTO.getRoleName());

        if (role == null) {
            throw new DataNotFoundException(
                    localizationUtils.getLocalizedMessage(MessageKeys.ROLE_DOES_NOT_EXISTS)
            );
        }

        if (role == RoleEnum.ADMIN) {
            throw new PermissionDenyException("Không được phép đăng ký tài khoản Admin");
        }

        //convert from userDTO => user
        User newUser = User.builder()
                .email(userDTO.getEmail())
                    .password(userDTO.getPassword())
                .username(userDTO.getUsername())
                .status(StatusEnum.ACTIVE)
                .build();

        newUser.setRole(role);

        String password = userDTO.getPassword();
        String encodedPassword = passwordEncoder.encode(password);
        newUser.setPassword(encodedPassword);

        return userRepository.save(newUser);
    }

    public String login (String email, String password) throws Exception {
        Optional<User> optional = Optional.empty();
        String subject = null;

        if (email != null) {
            optional = userRepository.findByEmail(email);
            subject = email;
        }

        if (optional.isEmpty()) {
            throw new DataNotFoundException(localizationUtils.getLocalizedMessage(MessageKeys.WRONG_PHONE_PASSWORD));
        }

        User existingUser = optional.get();

        if(!passwordEncoder.matches(password, existingUser.getPassword())) {
            throw new BadCredentialsException(localizationUtils.getLocalizedMessage(MessageKeys.PASSWORD_NOT_MATCH));
        }

        if (!existingUser.getStatus().equals(StatusEnum.ACTIVE)) {
            throw new DataNotFoundException(localizationUtils.getLocalizedMessage(MessageKeys.USER_IS_LOCKED));
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
        CustomerRegisterUtil.encodePassword(customer, passwordEncoder);

        userRepository.save(customer);
    }

}
