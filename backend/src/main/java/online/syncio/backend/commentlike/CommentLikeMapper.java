package online.syncio.backend.commentlike;

import lombok.AllArgsConstructor;
import online.syncio.backend.comment.Comment;
import online.syncio.backend.comment.CommentRepository;
import online.syncio.backend.exception.NotFoundException;
import online.syncio.backend.user.User;
import online.syncio.backend.user.UserRepository;
import org.springframework.stereotype.Component;

@Component
@AllArgsConstructor
public class CommentLikeMapper {

    private final CommentRepository commentRepository;
    private final UserRepository userRepository;


    public CommentLikeDTO mapToDTO(final CommentLike commentLike, final CommentLikeDTO commentLikeDTO) {
        commentLikeDTO.setCommentId(commentLike.getComment().getId());
        commentLikeDTO.setUserId(commentLike.getUser().getId());
        return commentLikeDTO;
    }


    public CommentLike mapToEntity(final CommentLikeDTO commentLikeDTO, final CommentLike commentLike) {
        final Comment comment = commentLikeDTO.getCommentId() == null ? null : commentRepository.findById(commentLikeDTO.getCommentId())
                .orElseThrow(() -> new NotFoundException(Comment.class, "id", commentLikeDTO.getCommentId().toString()));
        commentLike.setComment(comment);
        final User user = commentLikeDTO.getUserId() == null ? null : userRepository.findById(commentLikeDTO.getUserId())
                .orElseThrow(() -> new NotFoundException(User.class, "id", commentLikeDTO.getUserId().toString()));
        commentLike.setUser(user);
        return commentLike;
    }

}
