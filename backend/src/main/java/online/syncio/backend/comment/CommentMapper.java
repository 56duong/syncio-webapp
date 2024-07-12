package online.syncio.backend.comment;

import lombok.AllArgsConstructor;
import online.syncio.backend.exception.NotFoundException;
import online.syncio.backend.post.Post;
import online.syncio.backend.post.PostRepository;
import online.syncio.backend.user.User;
import online.syncio.backend.user.UserRepository;
import org.springframework.stereotype.Component;

@Component
@AllArgsConstructor
public class CommentMapper {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;


    public CommentDTO mapToDTO(final Comment comment, final CommentDTO commentDTO) {
        commentDTO.setId(comment.getId());
        commentDTO.setPostId(comment.getPost().getId());
        commentDTO.setUserId(comment.getUser().getId());
        commentDTO.setUsername(comment.getUser().getUsername());
        commentDTO.setCreatedDate(comment.getCreatedDate());
        commentDTO.setText(comment.getText());
        // if it is a reply, set the parent comment id, if it is a comment, set the replies count.
        // Reply don't need replies count, comment don't need parent comment id
        if(comment.getParentComment() != null) {
            // it is a reply
            commentDTO.setParentCommentId(comment.getParentComment().getId());
        }
        else {
            // it is a comment
            commentDTO.setRepliesCount(commentRepository.countByPostIdAndParentCommentId(comment.getPost().getId(), comment.getId()));
        }
        commentDTO.setLikesCount((long) comment.getCommentLikes().size());
        return commentDTO;
    }


    public Comment mapToEntity(final CommentDTO commentDTO, final Comment comment) {
        final Post post = commentDTO.getPostId() == null ? null : postRepository.findById(commentDTO.getPostId())
                .orElseThrow(() -> new NotFoundException(Post.class, "id", commentDTO.getPostId().toString()));
        comment.setPost(post);
        final User user = commentDTO.getUserId() == null ? null : userRepository.findById(commentDTO.getUserId())
                .orElseThrow(() -> new NotFoundException(User.class, "id", commentDTO.getUserId().toString()));
        comment.setUser(user);
        comment.setCreatedDate(commentDTO.getCreatedDate());
        comment.setText(commentDTO.getText());
        final Comment parentComment = commentDTO.getParentCommentId() == null ? null : commentRepository.findById(commentDTO.getParentCommentId())
                .orElseThrow(() -> new NotFoundException(Comment.class, "id", commentDTO.getParentCommentId().toString()));
        comment.setParentComment(parentComment);
        return comment;
    }

}
