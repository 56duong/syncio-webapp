package online.syncio.backend.comment;

import lombok.AllArgsConstructor;
import online.syncio.backend.exception.NotFoundException;
import online.syncio.backend.post.Post;
import online.syncio.backend.post.PostRepository;
import online.syncio.backend.user.User;
import online.syncio.backend.user.UserRepository;
import online.syncio.backend.utils.AuthUtils;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@AllArgsConstructor
public class CommentService {
    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final AuthUtils authUtils;



//    CRUD
    public List<CommentDTO> findAll() {
        final List<Comment> comments = commentRepository.findAll(Sort.by("createdDate"));
        return comments.stream()
                .map(comment -> mapToDTO(comment, new CommentDTO()))
                .toList();
    }

    public CommentDTO get(final UUID id) {
        return commentRepository.findById(id)
                .map(comment -> mapToDTO(comment, new CommentDTO()))
                .orElseThrow(() -> new NotFoundException(Comment.class, "id", id.toString()));
    }

    public List<CommentDTO> findByPostId(final UUID postId) {
        return commentRepository.findByPostId(postId)
                .stream()
                .map(comment -> mapToDTO(comment, new CommentDTO()))
                .toList();
    }

    public List<CommentDTO> getReplies(final UUID postId, final UUID parentCommentId) {
        return commentRepository.findByPostIdAndParentCommentId(postId, parentCommentId)
                .stream()
                .map(comment -> mapToDTO(comment, new CommentDTO()))
                .toList();
    }

    public List<CommentDTO> findByPostIdAndParentCommentIsNull(final UUID postId) {
        return commentRepository.findByPostIdAndParentCommentIsNullOrderByCreatedDateDesc(postId)
                .stream()
                .map(comment -> mapToDTO(comment, new CommentDTO()))
                .toList();
    }

    public Long countReplies(final UUID postId, final UUID parentCommentId) {
        return commentRepository.countByPostIdAndParentCommentId(postId, parentCommentId);
    }

    public UUID create(final CommentDTO commentDTO) {
        final UUID userId = authUtils.getCurrentLoggedInUserId();
        if(userId != null) commentDTO.setUserId(userId);

        final Comment comment = new Comment();
        mapToEntity(commentDTO, comment);
        return commentRepository.save(comment).getId();
    }

    public void update(final UUID id, final CommentDTO commentDTO) {
        final Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(Comment.class, "id", id.toString()));
        mapToEntity(commentDTO, comment);
        commentRepository.save(comment);
    }

    public void delete(final UUID id) {
        final Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(Comment.class, "id", id.toString()));
        commentRepository.delete(comment);
    }

    public Long countByPostId(final UUID postId) {
        return commentRepository.countByPostId(postId);
    }



//    MAPPER
    private CommentDTO mapToDTO(final Comment comment, final CommentDTO commentDTO) {
        commentDTO.setId(comment.getId());
        commentDTO.setPostId(comment.getPost().getId());
        commentDTO.setUserId(comment.getUser().getId());
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

    private Comment mapToEntity(final CommentDTO commentDTO, final Comment comment) {
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
