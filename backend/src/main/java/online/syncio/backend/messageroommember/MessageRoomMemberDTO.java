package online.syncio.backend.messageroommember;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class MessageRoomMemberDTO {
    private UUID messageRoomId;

    private UUID userId;

    private String username;

    private LocalDateTime dateJoined;

    private boolean isAdmin;

}