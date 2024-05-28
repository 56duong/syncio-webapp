package online.syncio.backend.post;

import jakarta.validation.Valid;
import online.syncio.backend.exception.ReferencedException;
import online.syncio.backend.exception.ReferencedWarning;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("${api.prefix}/posts")
public class PostController {

    private final PostService postService;

    public PostController(final PostService postService) {
        this.postService = postService;
    }

    @GetMapping
    public ResponseEntity<List<PostDTO>> getAllPosts() {
        return ResponseEntity.ok(postService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostDTO> getPost(@PathVariable(name = "id") final UUID id) {
        return ResponseEntity.ok(postService.get(id));
    }

    @PostMapping
    public ResponseEntity<UUID> createPost(@RequestBody @Valid PostDTO postDTO) {
        UUID createdId = postService.create(postDTO);
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

}
