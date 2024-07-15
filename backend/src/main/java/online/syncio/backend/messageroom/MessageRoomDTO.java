package online.syncio.backend.messageroom;

import lombok.Data;
import online.syncio.backend.messagecontent.MessageContentDTO;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class MessageRoomDTO {

    private UUID id;

    private String name;

    private LocalDateTime createdDate;

    private boolean isGroup;

    private UUID createdBy;

    private LocalDateTime lastSeen;

    private Long unSeenCount;

    private MessageContentDTO lastMessage;

    private String avatarURL;

}
