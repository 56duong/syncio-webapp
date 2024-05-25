package online.syncio.backend.comment;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(value = "/api/v1/comments")
public class CommentController {

    private final CommentService commentService;

    public CommentController(final CommentService commentService) {
        this.commentService = commentService;
    }

    @GetMapping
    public ResponseEntity<List<CommentDTO>> getAllComments() {
        return ResponseEntity.ok(commentService.findAll());
    }

    @GetMapping("/{postId}")
    public ResponseEntity<List<CommentDTO>> getCommentsByPostId(@PathVariable final UUID postId) {
        return ResponseEntity.ok(commentService.findByPostId(postId));
    }

    @GetMapping("/{postId}/{parentCommentId}")
    public ResponseEntity<List<CommentDTO>> getReplies(@PathVariable final UUID postId, @PathVariable final UUID parentCommentId) {
        return ResponseEntity.ok(commentService.getReplies(postId, parentCommentId));
    }

    @GetMapping("/{postId}/parentCommentIsNull")
    public ResponseEntity<List<CommentDTO>> getParentComments(@PathVariable final UUID postId) {
        return ResponseEntity.ok(commentService.findByPostIdAndParentCommentIsNull(postId));
    }

    @GetMapping("/count/{postId}")
    public ResponseEntity<Long> getCountComment(@PathVariable final UUID postId) {
        return ResponseEntity.ok(commentService.countByPostId(postId));
    }

    @PostMapping
    public ResponseEntity<UUID> createComment(@RequestBody @Valid final CommentDTO commentDTO) {
        final UUID createdId = commentService.create(commentDTO);
        return new ResponseEntity<>(createdId, HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable final UUID id) {
        commentService.delete(id);
        return ResponseEntity.noContent().build();
    }

}
