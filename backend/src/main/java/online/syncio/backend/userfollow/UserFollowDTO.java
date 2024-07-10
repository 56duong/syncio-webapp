package online.syncio.backend.userfollow;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class UserFollowDTO {
    private UUID targetId;
    private UUID actorId;
    private LocalDateTime createdDate;
    private String targetUsername;
    private String actorUsername;
    private boolean isFollowing;
}
