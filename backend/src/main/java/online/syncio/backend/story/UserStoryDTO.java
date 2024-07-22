package online.syncio.backend.story;


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

    private Long storyCount;

    private Long storyViewedCount;

}
