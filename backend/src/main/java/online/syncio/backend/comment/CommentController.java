package online.syncio.backend.comment;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import online.syncio.backend.utils.JwtTokenUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(value = "/api/v1/comments")
@AllArgsConstructor
public class CommentController {

    private final CommentService commentService;
    private final JwtTokenUtils jwtTokenUtils;

    @GetMapping
    public ResponseEntity<List<CommentDTO>> getAllComments() {
        return ResponseEntity.ok(commentService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CommentDTO> getComment(@PathVariable final UUID id) {
        return ResponseEntity.ok(commentService.get(id));
    }

    @GetMapping("/post/{postId}")
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

    /**
     * This method is used to send a comment to a specific post.
     * The @MessageMapping("/comment/{postId}") annotation means that this method
     * will be invoked when a message is sent to the "/comment/{postId}" destination.
     * The @SendTo("/topic/comment/{postId}") annotation means that the return value of this method
     * will be sent to the "/topic/comment/{postId}" destination.
     * @param postId the post id
     * @param token the token
     * @param commentDTO the comment
     * @return the comment
     */
    @MessageMapping("/comment/{postId}")
    @SendTo("/topic/comment/{postId}")
    public CommentDTO addComment(@DestinationVariable final UUID postId,
                                 @Header("token") final String token,
                                 final CommentDTO commentDTO) {
        final UUID userId = jwtTokenUtils.extractUserId(token);
        commentDTO.setUserId(userId);
        final UUID createdId = commentService.create(commentDTO);
        commentDTO.setId(createdId);
        return commentDTO;
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(@PathVariable final UUID id) {
        commentService.delete(id);
        return ResponseEntity.noContent().build();
    }

}
