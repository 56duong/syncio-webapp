package online.syncio.backend.idclass;

import lombok.Data;
import online.syncio.backend.comment.Comment;
import online.syncio.backend.user.User;

import java.io.Serializable;

@Data
public class PkUserCommentLike implements Serializable {
    private Comment comment;
    private User user;
}
