package online.syncio.backend.user;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.UUID;

@Data
@AllArgsConstructor
public class UserSearchDTO {
    private UUID id;

    @NotNull
    @Size(max = 30)
    private String username;

    private Long followerCount;

}
