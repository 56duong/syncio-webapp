package online.syncio.backend.comment;

import lombok.AllArgsConstructor;
import online.syncio.backend.exception.NotFoundException;
import online.syncio.backend.utils.AuthUtils;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@AllArgsConstructor
public class CommentService {
    private final CommentRepository commentRepository;
    private final AuthUtils authUtils;
    private final CommentMapper commentMapper;


    public List<CommentDTO> findAll() {
        final List<Comment> comments = commentRepository.findAll(Sort.by("createdDate"));
        return comments.stream()
                .map(comment -> commentMapper.mapToDTO(comment, new CommentDTO()))
                .toList();
    }


    public CommentDTO get(final UUID id) {
        return commentRepository.findById(id)
                .map(comment -> commentMapper.mapToDTO(comment, new CommentDTO()))
                .orElseThrow(() -> new NotFoundException(Comment.class, "id", id.toString()));
    }


    public List<CommentDTO> findByPostId(final UUID postId) {
        return commentRepository.findByPostId(postId)
                .stream()
                .map(comment -> commentMapper.mapToDTO(comment, new CommentDTO()))
                .toList();
    }


    public List<CommentDTO> getReplies(final UUID postId, final UUID parentCommentId) {
        return commentRepository.findByPostIdAndParentCommentId(postId, parentCommentId)
                .stream()
                .map(comment -> commentMapper.mapToDTO(comment, new CommentDTO()))
                .toList();
    }


    public List<CommentDTO> findByPostIdAndParentCommentIsNull(final UUID postId) {
        return commentRepository.findByPostIdAndParentCommentIsNullOrderByCreatedDateDesc(postId)
                .stream()
                .map(comment -> commentMapper.mapToDTO(comment, new CommentDTO()))
                .toList();
    }


    public Long countReplies(final UUID postId, final UUID parentCommentId) {
        return commentRepository.countByPostIdAndParentCommentId(postId, parentCommentId);
    }


    public UUID create(final CommentDTO commentDTO) {
        final UUID userId = authUtils.getCurrentLoggedInUserId();
        if(userId != null) commentDTO.setUserId(userId);

        final Comment comment = new Comment();
        commentMapper.mapToEntity(commentDTO, comment);
        return commentRepository.save(comment).getId();
    }


    public void update(final UUID id, final CommentDTO commentDTO) {
        final Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(Comment.class, "id", id.toString()));
        commentMapper.mapToEntity(commentDTO, comment);
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

}
