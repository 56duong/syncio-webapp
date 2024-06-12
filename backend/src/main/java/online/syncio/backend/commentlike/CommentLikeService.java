package online.syncio.backend.commentlike;

import lombok.AllArgsConstructor;
import online.syncio.backend.comment.Comment;
import online.syncio.backend.comment.CommentRepository;
import online.syncio.backend.exception.AppException;
import online.syncio.backend.exception.NotFoundException;
import online.syncio.backend.user.User;
import online.syncio.backend.user.UserRepository;
import online.syncio.backend.utils.AuthUtils;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@AllArgsConstructor
public class CommentLikeService {
    private final CommentLikeRepository commentLikeRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final AuthUtils authUtils;



//    CRUD
    public List<CommentLikeDTO> findAll() {
        final List<CommentLike> commentLikes = commentLikeRepository.findAll(Sort.by("createdDate"));
        return commentLikes.stream()
                .map(commentLike -> mapToDTO(commentLike, new CommentLikeDTO()))
                .toList();
    }

    public boolean hasCommentLiked(UUID commentId) {
        final UUID currentUserId = authUtils.getCurrentLoggedInUserId();
        // Not logged in
        if(currentUserId == null) {
            throw new AppException(HttpStatus.FORBIDDEN, "You must be logged in to like a comment", null);
        }
        Optional<CommentLike> commentLikeOptional = commentLikeRepository.findByCommentIdAndUserId(commentId, currentUserId);
        return commentLikeOptional.isPresent();
    }

    public Long countByCommentId(final UUID commentId) {
        return commentLikeRepository.countByCommentId(commentId);
    }

    public void toggleLike(UUID commentId) {
        UUID currentLoggedInUserId = authUtils.getCurrentLoggedInUserId();

        // Not logged in
        if (currentLoggedInUserId == null) {
            throw new AppException(HttpStatus.FORBIDDEN, "You must be logged in to like a comment", null);
        }

        Optional<CommentLike> commentLikeOptional = commentLikeRepository.findByCommentIdAndUserId(commentId, currentLoggedInUserId);
        if (commentLikeOptional.isPresent()) {
            // Unlike
            commentLikeRepository.delete(commentLikeOptional.get());
        } else {
            // Like
            CommentLikeDTO commentLikeDTO = new CommentLikeDTO();
            commentLikeDTO.setCommentId(commentId);
            commentLikeDTO.setUserId(currentLoggedInUserId);
            CommentLike commentLike = new CommentLike();
            mapToEntity(commentLikeDTO, commentLike);
            commentLikeRepository.save(commentLike);
        }
    }



//    MAPPER
    private CommentLikeDTO mapToDTO(final CommentLike commentLike, final CommentLikeDTO commentLikeDTO) {
        commentLikeDTO.setCommentId(commentLike.getComment().getId());
        commentLikeDTO.setUserId(commentLike.getUser().getId());
        return commentLikeDTO;
    }

    private CommentLike mapToEntity(final CommentLikeDTO commentLikeDTO, final CommentLike commentLike) {
        final Comment comment = commentLikeDTO.getCommentId() == null ? null : commentRepository.findById(commentLikeDTO.getCommentId())
                .orElseThrow(() -> new NotFoundException(Comment.class, "id", commentLikeDTO.getCommentId().toString()));
        commentLike.setComment(comment);
        final User user = commentLikeDTO.getUserId() == null ? null : userRepository.findById(commentLikeDTO.getUserId())
                .orElseThrow(() -> new NotFoundException(User.class, "id", commentLikeDTO.getUserId().toString()));
        commentLike.setUser(user);
        return commentLike;
    }
}
