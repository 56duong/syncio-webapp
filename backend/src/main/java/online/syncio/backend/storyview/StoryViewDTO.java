package online.syncio.backend.storyview;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class StoryViewDTO {

    private UUID storyId;

    private UUID userId;

    private LocalDateTime viewDate;
}
