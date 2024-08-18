package online.syncio.backend.like;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(value = "${api.prefix}/likes")
public class LikeController {

    private final LikeService likeService;

    public LikeController(final LikeService likeService) {
        this.likeService = likeService;
    }

    @GetMapping("/{postId}/likes")
    public ResponseEntity<Boolean> hasLiked(@PathVariable UUID postId) {

        boolean hasLiked = likeService.hasLiked(postId);


        return ResponseEntity.ok(hasLiked);
    }
    @GetMapping
    public ResponseEntity<List<LikeDTO>> getAllLikes() {
        return ResponseEntity.ok(likeService.findAll());
    }

    @GetMapping("/count/{postId}")
    public ResponseEntity<Long> getCountLike(@PathVariable UUID postId) {
        return ResponseEntity.ok(likeService.countByPostId(postId));
    }

    @PostMapping
    public ResponseEntity<Void> createLike(@RequestBody @Valid final LikeDTO likeDTO) {
        likeService.create(likeDTO);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    @DeleteMapping("/{postId}/{userId}")
    public ResponseEntity<Void> deleteLike(@PathVariable final UUID postId,
                                           @PathVariable final UUID userId) {
        likeService.deleteByPostIdAndUserId(postId, userId);
        return ResponseEntity.noContent().build();
    }

}
