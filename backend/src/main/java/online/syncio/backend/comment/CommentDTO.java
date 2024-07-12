package online.syncio.backend.comment;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class CommentDTO {

    private UUID id;

    private UUID postId;

    private UUID userId;

    private String username;

    private LocalDateTime createdDate;

    @NotNull
    @Size(max = 500)
    private String text;

    private UUID parentCommentId;

    private Long repliesCount;

    private Long likesCount;
}
