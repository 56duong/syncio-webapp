package online.syncio.backend.like;

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
public class LikeService {
    private final LikeRepository likeRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    public LikeService(LikeRepository likeRepository, PostRepository postRepository, UserRepository userRepository) {
        this.likeRepository = likeRepository;
        this.postRepository = postRepository;
        this.userRepository = userRepository;
    }



//    CRUD
    public List<LikeDTO> findAll() {
        final List<Like> likes = likeRepository.findAll(Sort.by("createdDate"));
        return likes.stream()
                .map(like -> mapToDTO(like, new LikeDTO()))
                .toList();
    }

    public void create(final LikeDTO likeDTO) {
        final Like like = new Like();
        mapToEntity(likeDTO, like);
        likeRepository.save(like);
    }

    public void update(final UUID postId, final UUID userId, final LikeDTO likeDTO) {
        final Like like = likeRepository.findByPostIdAndUserId(postId, userId)
                .orElseThrow(() -> new NotFoundException(Like.class, "postId", postId.toString(), userId.toString(), "userId"));
        mapToEntity(likeDTO, like);
        likeRepository.save(like);
    }

    public void deleteByPostIdAndUserId(final UUID postId, final UUID userId) {
        final Like like = likeRepository.findByPostIdAndUserId(postId, userId)
                .orElseThrow(() -> new NotFoundException(Like.class, "postId", postId.toString(), userId.toString(), "userId"));
        likeRepository.delete(like);
    }

    public Long countByPostId(final UUID postId) {
        return likeRepository.countByPostId(postId);
    }



//    MAPPER
    private LikeDTO mapToDTO(final Like like, final LikeDTO likeDTO) {
        likeDTO.setPostId(like.getPost().getId());
        likeDTO.setUserId(like.getUser().getId());
        return likeDTO;
    }

    private Like mapToEntity(final LikeDTO likeDTO, final Like like) {
        final Post post = likeDTO.getPostId() == null ? null : postRepository.findById(likeDTO.getPostId())
                .orElseThrow(() -> new NotFoundException(Post.class, "id", likeDTO.getPostId().toString()));
        like.setPost(post);
        final User user = likeDTO.getPostId() == null ? null : userRepository.findById(likeDTO.getUserId())
                .orElseThrow(() -> new NotFoundException(Post.class, "id", likeDTO.getPostId().toString()));
        like.setUser(user);
        return like;
    }
}
