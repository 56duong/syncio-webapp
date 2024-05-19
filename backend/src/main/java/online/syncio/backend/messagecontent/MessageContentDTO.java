package online.syncio.backend.messagecontent;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class MessageContentDTO {

    private UUID id;

    private UUID messageRoomId;

    private UUID userId;

    @NotNull
    @Size(max = 1000)
    private String message;

    private LocalDateTime dateSent;

}
