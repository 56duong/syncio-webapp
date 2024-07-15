package online.syncio.backend.user;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class UserDTO {

    private UUID id;

    @NotNull
    @Size(max = 89)
    @Email(message = "Email should be valid")
    private String email;

    @NotNull
    @Size(max = 30)
    private String username;

    @NotNull
    @Size(max = 100)
    private String password;

    @Size(max = 1000)
    private String coverURL;

    private String bio;

    private long followerCount;

    // Automatically create "creation time"
    private LocalDateTime createdDate = LocalDateTime.now();

    @NotNull
    private RoleEnum role;

    @NotNull
    private StatusEnum status = StatusEnum.ACTIVE;

}
