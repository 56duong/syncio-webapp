package online.syncio.backend.commentlike;

import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping(value = "/api/v1/commentlikes")
@AllArgsConstructor
public class CommentLikeController {

    private final CommentLikeService commentLikeService;

    /**
     * Get count of likes for a comment
     * @param commentId
     * @return count of likes
     */
    @GetMapping("/count/{commentId}")
    public ResponseEntity<Long> getCountLike(@PathVariable final UUID commentId) {
        return ResponseEntity.ok(commentLikeService.countByCommentId(commentId));
    }

    /**
     * Check if the current user has liked a comment
     * @param commentId
     * @return true if the current user has liked the comment, false otherwise
     */
    @GetMapping("/hasCommentLiked/{commentId}")
    public ResponseEntity<Boolean> hasCommentLiked(@PathVariable final UUID commentId) {
        return ResponseEntity.ok(commentLikeService.hasCommentLiked(commentId));
    }

    /**
     * Toggle like for a comment
     * @param commentId
     */
    @PostMapping("/{commentId}")
    public ResponseEntity<Void> toggleLike(@PathVariable final UUID commentId) {
        commentLikeService.toggleLike(commentId);
        return ResponseEntity.ok().build();
    }

}
