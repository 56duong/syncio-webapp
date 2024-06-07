package online.syncio.backend.user;


import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.UUID;

@Data
public class UserStoryDTO {

    private UUID id;

    @NotNull
    @Size(max = 30)
    private String username;

    @Size(max = 1000)
    private String avtURL;

    private boolean hasUnseenStory = false;

}
