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

    @GetMapping("/count/{postId}")
    public ResponseEntity<Long> getCountComment(@PathVariable final UUID postId) {
        return ResponseEntity.ok(commentService.countByPostId(postId));
    }

    @PostMapping
    public ResponseEntity<Void> createComment(@RequestBody @Valid final CommentDTO commentDTO) {
        commentService.create(commentDTO);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable final UUID id) {
        commentService.delete(id);
        return ResponseEntity.noContent().build();
    }

}
