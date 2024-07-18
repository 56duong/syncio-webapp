package online.syncio.backend.config;


import lombok.RequiredArgsConstructor;
import online.syncio.backend.user.User;
import online.syncio.backend.user.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.actuate.autoconfigure.security.reactive.EndpointRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Optional;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig implements WebMvcConfigurer {
    @Value("${api.prefix}")
    private String apiPrefix;

    private final UserRepository userRepository;
    //user's detail object
    @Bean
    public UserDetailsService userDetailsService() {
        return subject ->{
            Optional<User> userByEmail = userRepository.findByEmail(subject);
            if(userByEmail.isPresent()) {
                return userByEmail.get();
            }

//            Optional<User> userByUsername = userRepository.findByUserName(subject);
//            if(userByUsername.isPresent()) {
//                return userByUsername.get();
//            }

            throw new UsernameNotFoundException("User not found");
        };
    }
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService());
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config
    ) throws Exception {
        return config.getAuthenticationManager();
    }

    @Configuration
    @EnableWebSecurity(debug = false)
    @EnableGlobalMethodSecurity(prePostEnabled = true)
    @RequiredArgsConstructor
    public static class WebSecurityConfig {
        private final JwtTokenFilter jwtTokenFilter;

        @Value("${api.prefix}")
        private String apiPrefix;
        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http)  throws Exception{
            http
                    .addFilterBefore(jwtTokenFilter, UsernamePasswordAuthenticationFilter.class)
                    .authorizeHttpRequests(requests -> {
                        requests
                        .anyRequest().permitAll()
                        ;
                    })

                    .csrf(AbstractHttpConfigurer::disable);
            http.securityMatcher(String.valueOf(EndpointRequest.toAnyEndpoint()));
            return http.build();
        }
    }
    @Bean
    public AuditorAware auditorAware() {
        return () -> {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if(authentication == null || !authentication.isAuthenticated() || authentication instanceof AnonymousAuthenticationToken) {
                return Optional.empty();
            }

            User user = userRepository.findByUsername(authentication.getName()).get();
            return Optional.of(user);
        };
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler(apiPrefix + "/images/**")
                .addResourceLocations("file:uploads/");

        registry.addResourceHandler(apiPrefix + "/audio/**")
                .addResourceLocations("file:uploads/");
    }


}
