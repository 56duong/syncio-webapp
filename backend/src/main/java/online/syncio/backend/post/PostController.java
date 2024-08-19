package online.syncio.backend.post;

import com.fasterxml.jackson.core.JsonProcessingException;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import online.syncio.backend.like.LikeService;
import online.syncio.backend.userfollow.UserFollow;
import online.syncio.backend.userfollow.UserFollowRepository;
import online.syncio.backend.utils.AuthUtils;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Paths;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping(value = "${api.prefix}/posts")
@AllArgsConstructor
public class PostController {
    private final IPostRedisService postRedisService;
    private final PostService postService;
    private final LikeService likeService;
    private final SimpMessagingTemplate simpMessagingTemplate;
    private final AuthUtils authUtils;
    private final UserFollowRepository userFollowRepository;

    @GetMapping
    public Page<PostDTO> getPosts(@RequestParam(defaultValue = "0") int pageNumber,
                               @RequestParam(defaultValue = "10") int pageSize) throws JsonProcessingException {
        String cacheKey = "posts_page_" + pageNumber + "_" + pageSize;
//        postRedisService.clear();
        // Try to get cached data
        Page<PostDTO> cachedPosts = postRedisService.findAllPostsInCache(cacheKey);
        if (cachedPosts != null) {
            return cachedPosts; // Return cached data if available
        }

        // If not in cache, fetch from the database
        Page<PostDTO> posts = postService.getPosts(PageRequest.of(pageNumber, pageSize));

        // Cache the result
        postRedisService.cachePosts(cacheKey, posts);

        return posts;

    }

    @GetMapping("/following")
    public Page<PostDTO> getPostsFollowing(@RequestParam(defaultValue = "0") int pageNumber,
                                           @RequestParam(defaultValue = "10") int pageSize) {
        return postService.getPostsFollowing(PageRequest.of(pageNumber, pageSize));

    }

    @PostMapping("/interests")
    public ResponseEntity<Page<PostDTO>> getPostsInterests(@RequestParam(defaultValue = "0") int pageNumber,
                                                           @RequestParam(defaultValue = "10") int pageSize,
                                                           @RequestBody Set<UUID> postIds) {
        Page<PostDTO> posts = postService.getPostsInterests(PageRequest.of(pageNumber, pageSize), postIds);
        if(posts.isEmpty()){
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        }
        return ResponseEntity.ok(posts);
    }

    @PostMapping("/feed")
    public Page<PostDTO> getPostsFeed(@RequestParam(defaultValue = "0") int pageNumber,
                                      @RequestParam(defaultValue = "10") int pageSize,
                                      @RequestBody Set<UUID> postIds) {
        return postService.getPostsFeed(PageRequest.of(pageNumber, pageSize), postIds);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Boolean> isPostCreatedByUserIFollow(@PathVariable(name = "userId") final UUID userId) {
        return ResponseEntity.ok(postService.isPostCreatedByUserIFollow(userId));
    }

    @GetMapping("/details/{id}")
    public ResponseEntity<PostDTO> getPost(@PathVariable(name = "id") final UUID id) {
        return ResponseEntity.ok(postService.get(id));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createPost(@RequestPart("post") @Valid CreatePostDTO createPostDTO,
                                        @RequestPart(name = "images", required = false) List<MultipartFile> images,
                                        @RequestPart(name = "audio", required = false) MultipartFile audio) throws IOException {

        if (images != null && !images.isEmpty()) {
            createPostDTO.setFiles(images);
        }
        if (audio != null) {
            createPostDTO.setAudio(audio);
        }
        final PostDTO createdPost = postService.create(createPostDTO);

        // get all followers
        final UUID currentUserId = authUtils.getCurrentLoggedInUserId();
        final List<UserFollow> followers = userFollowRepository.findAllByTargetId(currentUserId);
        // send post to all followers
        followers.forEach(follower -> {
            simpMessagingTemplate.convertAndSendToUser(follower.getActor().getId().toString(), "/queue/newPost", createdPost);
        });
        // send to myself
        simpMessagingTemplate.convertAndSendToUser(currentUserId.toString(), "/queue/newPost", createdPost);

        return new ResponseEntity<>(createdPost, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UUID> updatePost(@PathVariable(name = "id") final UUID id,
                                           @RequestBody @Valid final PostDTO postDTO) {
        postService.update(id, postDTO);
        return ResponseEntity.ok(id);
    }

    @PostMapping("/{id}/{userId}/like")
    public ResponseEntity<?> likePost(@PathVariable(name = "id") final UUID id,
                                           @PathVariable(name = "userId") final UUID userId) {
        return likeService.toggleLike(id, userId);
    }

    @GetMapping("/images/{imageName}")
    public ResponseEntity<?> viewImage(@PathVariable String imageName) {
        try {
            java.nio.file.Path imagePath = Paths.get("uploads/"+imageName);
            UrlResource resource = new UrlResource(imagePath.toUri());

            if (resource.exists()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.IMAGE_JPEG)
                        .body(resource);
            } else {
                return ResponseEntity.ok()
                        .contentType(MediaType.IMAGE_JPEG)
                        .body(new UrlResource(Paths.get("uploads/notfound.jpeg").toUri()));
            }
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // change flag of post
    @PutMapping("/{postId}/flag")
    public ResponseEntity<Void> flagPost(@PathVariable(name = "postId") final UUID postId) {
        try {
            postService.setFlag(postId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{postId}/unflag")
    public ResponseEntity<Void> unFlagPost(@PathVariable(name = "postId") final UUID postId) {
        try {
            postService.setUnFlag(postId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/reported")
    public Page<PostDTO> getPostReport(@RequestParam(defaultValue = "0") int pageNumber,
                                       @RequestParam(defaultValue = "10") int pageSize) {
        return postService.getPostReported(PageRequest.of(pageNumber, pageSize));
    }

    @GetMapping("/flagged")
    public Page<PostDTO> getPostFlagged(@RequestParam(defaultValue = "0") int pageNumber,
                                        @RequestParam(defaultValue = "10") int pageSize) {
        return postService.getPostUnFlagged(PageRequest.of(pageNumber, pageSize));
    }

    @GetMapping("/all-posts/{id}")
    public ResponseEntity<List<PostDTO>> getAllPostsByUserId(@PathVariable(name = "id") final UUID id) {
        return ResponseEntity.ok(postService.getAllPostsByUserId(id));
    }

    @GetMapping("/user-posts/{id}")
    public ResponseEntity<Page<PostDTO>> getPostsByUserId(@PathVariable(name = "id") final UUID id,
                                                          @RequestParam(defaultValue = "0") final int pageNumber,
                                                          @RequestParam(defaultValue = "12") final int pageSize,
                                                          @RequestParam(defaultValue = "true") final boolean isDesc) {
        final PageRequest pageRequest = PageRequest.of(pageNumber, pageSize, isDesc ? Sort.by("created_date").descending() : Sort.by("created_date").ascending());
        return ResponseEntity.ok(postService.getPostsByUserId(id, pageRequest));
    }

}
