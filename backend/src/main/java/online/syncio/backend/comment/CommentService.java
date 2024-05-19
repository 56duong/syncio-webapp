package online.syncio.backend.comment;

import online.syncio.backend.exception.NotFoundException;
import online.syncio.backend.post.Post;
import online.syncio.backend.post.PostRepository;
import online.syncio.backend.user.User;
import online.syncio.backend.user.UserRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class CommentService {
    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    public CommentService(CommentRepository commentRepository, PostRepository postRepository, UserRepository userRepository) {
        this.commentRepository = commentRepository;
        this.postRepository = postRepository;
        this.userRepository = userRepository;
    }



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

    public UUID create(final CommentDTO commentDTO) {
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
        return commentDTO;
    }

    private Comment mapToEntity(final CommentDTO commentDTO, final Comment comment) {
        final Post post = commentDTO.getPostId() == null ? null : postRepository.findById(commentDTO.getPostId())
                .orElseThrow(() -> new NotFoundException(Post.class, "id", commentDTO.getPostId().toString()));
        comment.setPost(post);
        final User user = commentDTO.getPostId() == null ? null : userRepository.findById(commentDTO.getUserId())
                .orElseThrow(() -> new NotFoundException(User.class, "id", commentDTO.getUserId().toString()));
        comment.setUser(user);
        comment.setCreatedDate(commentDTO.getCreatedDate());
        comment.setText(commentDTO.getText());
        return comment;
    }
}
