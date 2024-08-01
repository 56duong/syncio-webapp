package online.syncio.backend.auth.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserLoginDTO {
    @JsonProperty("emailOrUsername")
    @NotBlank(message = "{user.login.email.blank}")
    private String emailOrUsername;

    @NotBlank(message = "{user.login.password.blank}")
    @Size(min = 6, max = 100, message = "{user.login.password.length}")
    private String password;

}
