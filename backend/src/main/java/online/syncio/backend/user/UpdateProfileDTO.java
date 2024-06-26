package online.syncio.backend.user;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UpdateProfileDTO {
    @NotBlank(message = "Email cannot be blank")
    private String email;
    @NotBlank(message = "Username cannot be blank")
    private String username;
    private String bio;
}
