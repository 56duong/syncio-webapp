package online.syncio.backend.like;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import online.syncio.backend.auth.responses.RegisterResponse;
import online.syncio.backend.auth.responses.ResponseObject;
import online.syncio.backend.exception.NotFoundException;
import online.syncio.backend.keyword.KeywordService;
import online.syncio.backend.post.Post;
import online.syncio.backend.post.PostRepository;
import online.syncio.backend.user.User;
import online.syncio.backend.user.UserRepository;
import online.syncio.backend.utils.AuthUtils;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
@AllArgsConstructor
public class LikeService {

    private final LikeRepository likeRepository;
    private final UserRepository userRepository;
    private final AuthUtils authUtils;
    private final LikeMapper likeMapper;
    private final PostRepository postRepository;
    private final KeywordService keywordService;


    public List<LikeDTO> findAll() {
        final List<Like> likes = likeRepository.findAll(Sort.by("createdDate"));
        return likes.stream()
                .map(like -> likeMapper.mapToDTO(like, new LikeDTO()))
                .toList();
    }


    public void create(final LikeDTO likeDTO) {
        likeDTO.setUserId(authUtils.getCurrentLoggedInUserId());
        final Like like = new Like();
        likeMapper.mapToEntity(likeDTO, like);
        likeRepository.save(like);
    }


    public void update(final UUID postId, final UUID userId, final LikeDTO likeDTO) {
        final Like like = likeRepository.findByPostIdAndUserId(postId, userId)
                .orElseThrow(() -> new NotFoundException(Like.class, "postId", postId.toString(), userId.toString(), "userId"));
        likeMapper.mapToEntity(likeDTO, like);
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


    public boolean hasLiked(UUID postId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentPrincipalName = authentication.getName();
        User curUser = userRepository.findByUsername(currentPrincipalName).orElse(null);
        Optional<Like> likeOptional = likeRepository.findByPostIdAndUserId(postId, curUser.getId());
        return likeOptional.isPresent();
    }


    @Transactional
    public void like (UUID postId, UUID userId) {
        try {
            Post post = postRepository.findById(postId)
                    .orElseThrow(() -> new NotFoundException(Post.class, "id", postId.toString()));
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new NotFoundException(User.class, "id", userId.toString()));

            // Check if the like already exists
            if (post.getLikes().stream().anyMatch(like -> like.getUser().equals(user))) {
                System.out.println("Like already exists.");
                return;
            }

            Like like = new Like();
            like.setPost(post);
            like.setUser(user);
            likeRepository.save(like);


            System.out.println("Like added successfully.");
        } catch (Exception e) {
            System.err.println("Failed to add like: " + e.getMessage());
            e.printStackTrace();
        }
    }


    @Transactional
    public ResponseEntity<?> toggleLike (UUID postId, UUID userId) {
        try {
            Post post = postRepository.findById(postId)
                    .orElseThrow(() -> new NotFoundException(Post.class, "id", postId.toString()));

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new NotFoundException(User.class, "id", userId.toString()));

            Optional<Like> existingLike = likeRepository.findLikeByPostAndUser(postId, userId);

            if (existingLike.isPresent()) {
                post.getLikes().remove(existingLike.get());
                likeRepository.delete(existingLike.get());

                return ResponseEntity.ok(ResponseObject.builder()
                        .status(HttpStatus.CREATED)
                        .data(RegisterResponse.fromUser(user))
                        .message("Like removed successfully.")
                        .build());
            } else {
                Like newLike = new Like();
                newLike.setPost(post);
                newLike.setUser(user);
                likeRepository.save(newLike);

                // Extract keywords from the post
                Set<String> updatedKeywords = keywordService.generateUpdateKeywords(post, user);
                // Update the user's interested keywords
                userRepository.updateInterestKeywords(userId, String.join(", ", updatedKeywords));

                return ResponseEntity.ok(ResponseObject.builder()
                        .status(HttpStatus.CREATED)
                        .data(RegisterResponse.fromUser(user))
                        .message("Like added successfully.")
                        .build());
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ResponseObject.builder()
                    .status(HttpStatus.BAD_REQUEST)
                    .data(null)
                    .message("Failed to toggle like.")
                    .build());
        }
    }

}
