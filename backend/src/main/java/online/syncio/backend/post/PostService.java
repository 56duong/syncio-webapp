package online.syncio.backend.post;

import online.syncio.backend.comment.Comment;
import online.syncio.backend.comment.CommentRepository;
import online.syncio.backend.exception.NotFoundException;
import online.syncio.backend.exception.ReferencedWarning;
import online.syncio.backend.like.Like;
import online.syncio.backend.like.LikeRepository;
import online.syncio.backend.report.Report;
import online.syncio.backend.report.ReportRepository;
import online.syncio.backend.user.User;
import online.syncio.backend.user.UserRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class PostService {
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final LikeRepository likeRepository;
    private final CommentRepository commentRepository;
    private final ReportRepository reportRepository;

    public PostService(PostRepository postRepository, UserRepository userRepository, LikeRepository likeRepository, CommentRepository commentRepository, ReportRepository reportRepository) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.likeRepository = likeRepository;
        this.commentRepository = commentRepository;
        this.reportRepository = reportRepository;
    }

    

//    CRUD
    public List<PostDTO> findAll() {
        final List<Post> posts = postRepository.findAll(Sort.by("createdDate").descending());
        return posts.stream()
                .map(post -> mapToDTO(post, new PostDTO()))
                .toList();
    }

    public PostDTO get(final UUID id) {
        return postRepository.findById(id)
                .map(post -> mapToDTO(post, new PostDTO()))
                .orElseThrow(() -> new NotFoundException(Post.class, "id", id.toString()));
    }

    public UUID create(final PostDTO postDTO) {
            User user = userRepository.findById(postDTO.getCreatedBy())
                .orElseThrow(() -> new NotFoundException(User.class, "id", postDTO.getCreatedBy().toString()));

        Post post = new Post();
        post.setCreatedBy(user);
        mapToEntity(postDTO, post);
        return postRepository.save(post).getId();
    }

    public void update(final UUID id, final PostDTO postDTO) {
        final Post post = postRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(Post.class, "id", id.toString()));
        mapToEntity(postDTO, post);
        postRepository.save(post);
    }

    public void delete(final UUID id) {
        final Post post = postRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(Post.class, "id", id.toString()));
        postRepository.delete(post);
    }


//    MAPPER
    private PostDTO mapToDTO(final Post post, final PostDTO postDTO) {
        postDTO.setId(post.getId());
        postDTO.setCaption(post.getCaption());
        postDTO.setPhotos(post.getPhotos());
        postDTO.setCreatedDate(post.getCreatedDate());
        postDTO.setFlag(post.getFlag());
        postDTO.setCreatedBy(post.getCreatedBy().getId());
        return postDTO;
    }

    private Post mapToEntity(final PostDTO postDTO, final Post post) {
        post.setCaption(postDTO.getCaption());
        post.setPhotos(postDTO.getPhotos());
        post.setCreatedDate(postDTO.getCreatedDate());
        post.setFlag(postDTO.getFlag());
        final User user = postDTO.getCreatedBy() == null ? null : userRepository.findById(postDTO.getCreatedBy())
                .orElseThrow(() -> new NotFoundException(User.class, "id", postDTO.getCreatedBy().toString()));
        post.setCreatedBy(user);
        return post;
    }



//    REFERENCED
    public ReferencedWarning getReferencedWarning(final UUID id) {
        final ReferencedWarning referencedWarning = new ReferencedWarning();
        final Post post = postRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(Post.class, "id", id.toString()));

        // Like
        final Like postLike = likeRepository.findFirstByPost(post);
        if (postLike != null) {
            referencedWarning.setKey("post.like.post.referenced");
            referencedWarning.addParam(postLike.getPost().getId());
            return referencedWarning;
        }

        // Comment
        final Comment postComment = commentRepository.findFirstByPost(post);
        if (postComment != null) {
            referencedWarning.setKey("post.comment.post.referenced");
            referencedWarning.addParam(postComment.getPost().getId());
            return referencedWarning;
        }

        // Report
        final Report postReport = reportRepository.findFirstByPost(post);
        if (postReport != null) {
            referencedWarning.setKey("post.report.post.referenced");
            referencedWarning.addParam(postReport.getPost().getId());
            return referencedWarning;
        }

        return null;
    }
}
