package online.syncio.backend.utils;

import online.syncio.backend.user.User;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class AuthUtils {
    /**
     * Get the current logged in user id
     * @return the current logged in user id or null if no user is logged in
     */
    public UUID getCurrentLoggedInUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if(authentication == null || !authentication.isAuthenticated() || authentication instanceof AnonymousAuthenticationToken) {
            return null;
        }
        User user = (User) authentication.getPrincipal();
        return user.getId();
    }

}
