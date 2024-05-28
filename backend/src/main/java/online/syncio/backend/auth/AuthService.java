package online.syncio.backend.auth;

import lombok.RequiredArgsConstructor;
import online.syncio.backend.config.LocalizationUtils;
import online.syncio.backend.exception.DataNotFoundException;
import online.syncio.backend.exception.ExpiredTokenException;
import online.syncio.backend.exception.PermissionDenyException;
import online.syncio.backend.role.RoleEntity;
import online.syncio.backend.role.RoleRepository;
import online.syncio.backend.user.StatusEnum;
import online.syncio.backend.user.User;
import online.syncio.backend.user.UserRepository;
import online.syncio.backend.auth.request.RegisterDTO;
import online.syncio.backend.utils.JwtTokenUtils;
import online.syncio.backend.utils.MessageKeys;
import org.apache.catalina.LifecycleState;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@RequiredArgsConstructor
@Service
public class AuthService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final LocalizationUtils localizationUtils;
    private final TokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenUtils jwtTokenUtil;
    private final AuthenticationManager authenticationManager;
    @Transactional
    public User createUser(RegisterDTO userDTO) throws Exception {
        //register user
        String email = userDTO.getEmail();

        if(!email.isBlank() && userRepository.existsByEmail(email)) {
            throw new DataIntegrityViolationException("Email đã tồn tại");
        }
        RoleEntity role =roleRepository.findById(userDTO.getRoleId())
                .orElseThrow(() -> new DataNotFoundException(
                        localizationUtils.getLocalizedMessage(MessageKeys.ROLE_DOES_NOT_EXISTS)));
        if(role.getName().toUpperCase().equals(RoleEntity.ADMIN)) {
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

    public String login(
            String email,
            String password,
            Long roleId
    ) throws Exception {
        Optional<User> optionalUser = Optional.empty();
        String subject = null;
        if(optionalUser.isEmpty() && email != null) {
            optionalUser =   userRepository.findByEmail(email);
            subject = email;
        }

        if(optionalUser.isEmpty()) {
            throw new DataNotFoundException(localizationUtils.getLocalizedMessage(MessageKeys.WRONG_PHONE_PASSWORD));
        }

        User existingUser = optionalUser.get();


        if(!passwordEncoder.matches(password, existingUser.getPassword())) {
            throw new BadCredentialsException(localizationUtils.getLocalizedMessage(MessageKeys.WRONG_PHONE_PASSWORD));

        }

        if(!optionalUser.get().getStatus().equals(StatusEnum.ACTIVE)) {
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



}
