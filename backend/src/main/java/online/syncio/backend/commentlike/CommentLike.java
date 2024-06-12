package online.syncio.backend.commentlike;

import jakarta.persistence.*;
import lombok.Data;
import online.syncio.backend.comment.Comment;
import online.syncio.backend.idclass.PkUserCommentLike;
import online.syncio.backend.user.User;

@Entity
@Table(name = "comment_like")
@IdClass(PkUserCommentLike.class)
@Data
public class CommentLike {
    @Id
    @ManyToOne
    @JoinColumn(name = "comment_id")
    private Comment comment;

    @Id
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}
