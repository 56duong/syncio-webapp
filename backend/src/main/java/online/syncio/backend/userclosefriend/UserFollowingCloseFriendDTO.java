package online.syncio.backend.userclosefriend;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
public class UserFollowingCloseFriendDTO {
    private UUID targetId;
    private String targetUsername;
    private boolean isCloseFriend;
}
