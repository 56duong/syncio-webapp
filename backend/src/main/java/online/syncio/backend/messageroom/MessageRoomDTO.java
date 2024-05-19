package online.syncio.backend.messageroom;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class MessageRoomDTO {

    private UUID id;

    private LocalDateTime createdDate;

}
