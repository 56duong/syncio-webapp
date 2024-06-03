package online.syncio.backend.auth.responses;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import online.syncio.backend.role.RoleEntity;
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



//    @JsonProperty("facebook_account_id")
//    private int facebookAccountId;
//
//    @JsonProperty("google_account_id")
//    private int googleAccountId;

    @JsonProperty("role")
    private RoleEntity role;
    public static AuthResponse fromUser(User user) {
        return AuthResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .status(String.valueOf(user.getStatus()))
//                .facebookAccountId(user.getFacebookAccountId())
//                .googleAccountId(user.getGoogleAccountId())
                .role(user.getRole())
                .build();
    }
}
