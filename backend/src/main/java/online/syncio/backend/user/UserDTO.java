package online.syncio.backend.user;


import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import online.syncio.backend.role.RoleEntity;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class UserDTO {

    private UUID id;

    @NotNull
    @Size(max = 89)
    private String email;

    @NotNull
    @Size(max = 30)
    private String username;

    @NotNull
    @Size(max = 100)
    private String password;

    @Size(max = 1000)
    private String avtURL;

    @Size(max = 1000)
    private String coverURL;

    private String bio;

    private LocalDateTime createdDate;

    @NotNull
    private RoleEntity role;

    @NotNull
    private StatusEnum status;

}
