package online.syncio.backend.auth.responses;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import online.syncio.backend.user.RoleEnum;
import online.syncio.backend.user.User;

import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AuthResponse {
    @JsonProperty("id")
    private UUID id;

    @JsonProperty("username")
    private String username;

    @JsonProperty("email")
    private String email;

    @JsonProperty("status")
    private String status;


    @JsonProperty("role")
    private RoleEnum role;

    private String bio;

    public static AuthResponse fromUser(User user) {
        return AuthResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .status(String.valueOf(user.getStatus()))
                .role(user.getRole())
                .bio(user.getBio())
                .build();
    }
}
