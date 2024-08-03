package online.syncio.backend.config;


import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;

import online.syncio.backend.user.User;
import online.syncio.backend.utils.JwtTokenUtils;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.util.Pair;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtTokenFilter extends OncePerRequestFilter {
    @Value("${api.prefix}")
    private String apiPrefix;
    private final UserDetailsService userDetailsService;
    private final JwtTokenUtils jwtTokenUtil;
    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain)
            throws ServletException, IOException {
        try {
            if(isBypassToken(request)) {
                filterChain.doFilter(request, response); //enable bypass
                return;
            }

            final String authHeader = request.getHeader("Authorization");

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                if(isHandleBothCases(request)) {
                    filterChain.doFilter(request, response);
                    return;
                }
                response.sendError(
                        HttpServletResponse.SC_UNAUTHORIZED,
                        "authHeader null or not started with Bearer");
                return;
            }

            final String token = authHeader.substring(7);
            final String email = jwtTokenUtil.extractEmail(token);
            if (email != null
                    && SecurityContextHolder.getContext().getAuthentication() == null) {
                User userDetails = (User) userDetailsService.loadUserByUsername(email);
                if(jwtTokenUtil.validateToken(token, userDetails)) {
                    UsernamePasswordAuthenticationToken authenticationToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );
                    authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authenticationToken);
                }
            }

            filterChain.doFilter(request, response);
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write(e.getMessage());
        }

    }

    private boolean isBypassToken(@NonNull HttpServletRequest request) {
        final List<Pair<String, String>> bypassTokens = Arrays.asList(

             

//
//                Pair.of(String.format("%s/healthcheck/health", apiPrefix), "GET"),
//                Pair.of(String.format("%s/actuator/**", apiPrefix), "GET"),
//
                Pair.of(String.format("%s/roles**", apiPrefix), "GET"),
                Pair.of(String.format("%s/users/register", apiPrefix), "POST"),
                Pair.of(String.format("%s/users/login", apiPrefix), "POST"),
                Pair.of(String.format("%s/users/refreshToken", apiPrefix), "POST"),
                Pair.of(String.format("%s/users/confirm-user-register", apiPrefix), "POST"),
                Pair.of(String.format("%s/users/reset_password", apiPrefix), "POST"),

                // Post
                Pair.of(String.format("%s/posts/images/**", apiPrefix), "GET"),
                Pair.of(String.format("%s/posts/", apiPrefix), "GET"),
                Pair.of(String.format("%s/posts/feed", apiPrefix), "POST"),
                Pair.of(String.format("%s/posts/details/**", apiPrefix), "GET"),

                // PostCollection
                Pair.of(String.format("%s/postcollections/user/**", apiPrefix), "GET"),

                // Like
                Pair.of(String.format("%s/likes/count/**", apiPrefix), "GET"),

                // Comment
                Pair.of(String.format("%s/comments/**", apiPrefix), "GET"),

                // CommentLike
                Pair.of(String.format("%s/commentlikes/count/**", apiPrefix), "GET"),

                // User
                Pair.of(String.format("%s/users/**/username", apiPrefix), "GET"),
                Pair.of(String.format("%s/users/username/**", apiPrefix), "GET"),
                Pair.of(String.format("%s/users/search/**", apiPrefix), "GET"),
                Pair.of(String.format("%s/username/**", apiPrefix), "GET"),
                Pair.of(String.format("%s/users/logout/**", apiPrefix), "POST"),

                // Label
                Pair.of(String.format("%s/labels/**", apiPrefix), "GET"),
                Pair.of(String.format("%s/labels/", apiPrefix), "GET"),

                // Story
                Pair.of(String.format("%s/stories/images/**", apiPrefix), "GET"),

                // WebSocket
                Pair.of("/live/**", "GET"),
                Pair.of("/uploads/**", "GET"),

                // Global images view
                Pair.of(String.format("%s/images/**", apiPrefix), "GET"),

                //Global audio view
                Pair.of(String.format("%s/audio/**", apiPrefix), "GET"),

                // Payment
                Pair.of(String.format("%s/payment/vnpay-callback", apiPrefix), "GET"),

                // Welcome page
                Pair.of("/welcome-page", "GET")
        );

        String requestPath = request.getServletPath();
        String requestMethod = request.getMethod();

        for (Pair<String, String> token : bypassTokens) {
            String path = token.getFirst();
            String method = token.getSecond();
            // Check if the request path and method match any pair in the bypassTokens list
            if (requestPath.matches(path.replace("**", ".*"))
                    && requestMethod.equalsIgnoreCase(method)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Handle url in both cases of the user already logged in and the user not logged in.
     * If the url is in the isHandleBothCases list, it will check header Authorization,
     * if the header is null or not started with Bearer, it will pass. (request from the user not logged in)
     * else, it will check the token, validate it and set the authentication. (request from the user already logged in)
     * Example: when a user requests to get the profile, the user can get the profile when logged in and not logged in.
     * Logged in will get specific data based on the logged-in user from SecurityContextHolder, not logged in will get only public posts.
     * @param request the request
     * @return true if the request path and method match any pair in the bypassTokens list
     */
    private boolean isHandleBothCases(@NonNull HttpServletRequest request) {
        final List<Pair<String, String>> bypassTokens = Arrays.asList(
                Pair.of(String.format("%s/users/profile/**", apiPrefix), "GET"),
                Pair.of(String.format("%s/posts/user-posts/**", apiPrefix), "GET")
        );

        String requestPath = request.getServletPath();
        String requestMethod = request.getMethod();

        for (Pair<String, String> token : bypassTokens) {
            String path = token.getFirst();
            String method = token.getSecond();
            // Check if the request path and method match any pair in the bypassTokens list
            if (requestPath.matches(path.replace("**", ".*"))
                    && requestMethod.equalsIgnoreCase(method)) {
                return true;
            }
        }
        return false;
    }

}