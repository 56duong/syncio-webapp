package online.syncio.backend.auth.responses;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import online.syncio.backend.user.RoleEnum;
import online.syncio.backend.user.StatusEnum;
import online.syncio.backend.user.User;

import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class RegisterResponse {
    @JsonProperty("id")
    private UUID id;

    @JsonProperty("email")
    private String email;

    @JsonProperty("username")
    private String username;

    @JsonProperty("status")
    private StatusEnum status;


    @JsonProperty("role")
    private RoleEnum role;

    public static RegisterResponse fromUser(User user) {
        return RegisterResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .status(user.getStatus())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }


}
