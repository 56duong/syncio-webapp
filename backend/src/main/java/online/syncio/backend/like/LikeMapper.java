package online.syncio.backend.like;

import lombok.AllArgsConstructor;
import online.syncio.backend.exception.NotFoundException;
import online.syncio.backend.post.Post;
import online.syncio.backend.post.PostRepository;
import online.syncio.backend.user.User;
import online.syncio.backend.user.UserRepository;
import org.springframework.stereotype.Component;

@Component
@AllArgsConstructor
public class LikeMapper {

    private final PostRepository postRepository;
    private final UserRepository userRepository;


    public LikeDTO mapToDTO(final Like like, final LikeDTO likeDTO) {
        likeDTO.setPostId(like.getPost().getId());
        likeDTO.setUserId(like.getUser().getId());
        likeDTO.setCreatedDate(like.getCreatedDate());
        return likeDTO;
    }


    public Like mapToEntity(final LikeDTO likeDTO, final Like like) {
        final Post post = likeDTO.getPostId() == null ? null : postRepository.findById(likeDTO.getPostId())
                .orElseThrow(() -> new NotFoundException(Post.class, "id", likeDTO.getPostId().toString()));
        like.setPost(post);
        final User user = likeDTO.getUserId() == null ? null : userRepository.findById(likeDTO.getUserId())
                .orElseThrow(() -> new NotFoundException(User.class, "id", likeDTO.getUserId().toString()));
        like.setUser(user);
        like.setCreatedDate(likeDTO.getCreatedDate());
        return like;
    }

}
