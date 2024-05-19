package online.syncio.backend.like;

import lombok.Data;

import java.util.UUID;

@Data
public class LikeDTO {

    private UUID postId;

    private UUID userId;
}
