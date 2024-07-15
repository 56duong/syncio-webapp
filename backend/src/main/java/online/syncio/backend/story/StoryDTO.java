package online.syncio.backend.story;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class StoryDTO {

    private UUID id;

    @NotNull
    private String photoURL;

    private LocalDateTime createdDate;

    @NotNull
    private Boolean flag;

    @NotNull
    private UUID createdBy;

    private boolean viewed;

}
