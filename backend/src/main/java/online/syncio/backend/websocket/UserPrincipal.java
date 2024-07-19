package online.syncio.backend.websocket;

import java.security.Principal;

/**
 * This class is used to represent the authenticated user in the session after a STOMP connection is established.
 * Used in the UserInterceptor class.
 */
public class UserPrincipal implements Principal {

    private String name;

    public UserPrincipal(String name) {
        this.name = name;
    }

    @Override
    public String getName() {
        return name;
    }

}
