package online.syncio.backend.commentlike;

import lombok.Data;

import java.util.UUID;

@Data
public class CommentLikeDTO {

    private UUID commentId;

    private UUID userId;
}
