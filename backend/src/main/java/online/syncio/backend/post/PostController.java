package online.syncio.backend.post;

import com.fasterxml.jackson.core.JsonProcessingException;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import online.syncio.backend.exception.ReferencedException;
import online.syncio.backend.exception.ReferencedWarning;
import online.syncio.backend.user.EngagementMetricsDTO;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
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




    // new - get 10 post/page
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
    public Page<PostDTO> getPostsInterests(@RequestParam(defaultValue = "0") int pageNumber,
                                           @RequestParam(defaultValue = "10") int pageSize,
                                           @RequestBody Set<UUID> postIds) {
        return postService.getPostsInterests(PageRequest.of(pageNumber, pageSize), postIds);
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

    @GetMapping("/{id}")
    public ResponseEntity<PostDTO> getPost(@PathVariable(name = "id") final UUID id) {
        return ResponseEntity.ok(postService.get(id));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createPost(@RequestPart("post") @Valid CreatePostDTO createPostDTO,
                                        @RequestPart(name = "images", required = false) List<MultipartFile> images,
                                        @RequestPart(name = "audio", required = false) MultipartFile audio) throws IOException {

        if (images != null && !images.isEmpty()) {
            createPostDTO.setPhotos(images);
        }
        if (audio != null) {
            createPostDTO.setAudio(audio);
        }
        ResponseEntity<?> createdId = postService.create(createPostDTO);
        return new ResponseEntity<>(createdId, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UUID> updatePost(@PathVariable(name = "id") final UUID id,
                                           @RequestBody @Valid final PostDTO postDTO) {
        postService.update(id, postDTO);
        return ResponseEntity.ok(id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable(name = "id") final UUID id) {
        final ReferencedWarning referencedWarning = postService.getReferencedWarning(id);
        if (referencedWarning != null) {
            throw new ReferencedException(referencedWarning);
        }
        postService.delete(id);
        return ResponseEntity.noContent().build();
    }
    @PostMapping("/{id}/{userId}/like")
    public ResponseEntity<?> likePost(@PathVariable(name = "id") final UUID id,
                                           @PathVariable(name = "userId") final UUID userId) {
        return postService.toggleLike(id, userId);

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

    @GetMapping("/engagement-metrics")
    public ResponseEntity<EngagementMetricsDTO> getEngagementMetrics(@RequestParam int days) {
        EngagementMetricsDTO metricsDTO = postService.getEngagementMetrics(days);
        return ResponseEntity.ok(metricsDTO);
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

    @GetMapping("/{id}/posts")
    public ResponseEntity<List<PostDTO>> getPostsByUserId(@PathVariable(name = "id") final UUID id) {
        return ResponseEntity.ok(postService.getPostsByUserId(id));
    }

    @GetMapping("/user/not-login/{id}")
    public ResponseEntity<List<PostDTO>> getPostsByUserId2(@PathVariable(name = "id") final UUID id) {
        return ResponseEntity.ok(postService.getPostsByVisibility(id));
    }

}
