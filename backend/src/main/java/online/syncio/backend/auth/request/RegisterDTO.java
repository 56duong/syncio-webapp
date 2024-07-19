package online.syncio.backend.auth.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.*;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class RegisterDTO {
    @Email(message = "{user.register.email.invalid}")
    @NotBlank(message = "{user.register.email.invalid}")
    private String email;

    @NotBlank(message = "{user.register.username.blank}")
    @Size(max = 30, min = 3, message = "{user.register.username.length}")
    private String username;

    @NotBlank(message = "{user.register.password.blank}")
    @Size(min = 6, max = 100, message = "{user.register.password.length}")
    @Pattern(regexp = "^[^\\s]+$", message = "Password must not contain spaces")
    private String password;

    @JsonProperty("retype_password")
    private String retypePassword;

}
