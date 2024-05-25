package online.syncio.backend.auth.responses;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import online.syncio.backend.role.RoleEntity;
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
    private RoleEntity role;

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
