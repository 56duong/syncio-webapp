package online.syncio.backend.userclosefriend;

import lombok.Data;

import java.util.UUID;

@Data
public class UserCloseFriendDTO {
    private UUID userId;
    private UUID closeFriendId;
}
