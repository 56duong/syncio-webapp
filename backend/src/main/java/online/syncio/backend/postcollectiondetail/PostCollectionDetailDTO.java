package online.syncio.backend.postcollectiondetail;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class PostCollectionDetailDTO {

    private UUID id;

    private UUID postId;

    private UUID postCollectionId;

    private LocalDateTime createdDate;
}
