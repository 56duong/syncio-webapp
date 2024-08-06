package online.syncio.backend.postcollection;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping(value = "${api.prefix}/postcollections")
@AllArgsConstructor
public class PostCollectionController {

    private final PostCollectionService postCollectionService;


    @GetMapping("/{id}")
    public ResponseEntity<PostCollectionDTO> findById(@PathVariable final UUID id) {
        final PostCollectionDTO postCollectionDTO = postCollectionService.findById(id);
        return ResponseEntity.ok(postCollectionDTO);
    }


    @GetMapping("/user/{id}")
    public ResponseEntity<List<PostCollectionDTO>> findByCreatedById(@PathVariable final UUID id) {
        final List<PostCollectionDTO> postCollectionDTOs = postCollectionService.findByCreatedById(id);
        return ResponseEntity.ok(postCollectionDTOs);
    }


    @PostMapping
    public ResponseEntity<UUID> create(@Valid @RequestPart(value = "photo", required = false) MultipartFile photo,
                                       @RequestPart(value = "postCollection") PostCollectionDTO postCollectionDTO) {
        if(photo != null && !photo.isEmpty()) {
            // Get the file name and set it as the collection id, cause the collection id will be used as the file name with .jpg extension
            String fileName = postCollectionService.uploadPhoto(photo);
            postCollectionDTO.setId(UUID.fromString(fileName));
        }
        else {
            postCollectionDTO.setId(UUID.randomUUID());
        }

        final UUID id = postCollectionService.create(postCollectionDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(id);
    }


    @PostMapping("/save-to-collection/{postId}")
    public ResponseEntity<UUID> saveToCollections(@PathVariable final UUID postId,
                                                  @RequestBody final List<UUID> collectionIds) {
        final UUID id = postCollectionService.saveToCollections(postId, collectionIds);
        return ResponseEntity.status(HttpStatus.CREATED).body(id);
    }


    @GetMapping("/post/user/{postId}/{userId}")
    public ResponseEntity<Set<PostCollectionDTO>> findByPostIdAndCreatedById(@PathVariable final UUID postId, @PathVariable final UUID userId) {
        final Set<PostCollectionDTO> postCollectionDTOs = postCollectionService.findByPostIdAndCreatedById(postId, userId);
        return ResponseEntity.ok(postCollectionDTOs);
    }


    @DeleteMapping("/delete-image/{id}")
    public ResponseEntity<Boolean> deleteImage(@PathVariable final UUID id) {
        boolean isDeleted = postCollectionService.deleteImage(id);
        return ResponseEntity.ok(isDeleted);
    }


    @PatchMapping
    public ResponseEntity<UUID> update(@Valid @RequestPart(value = "photo", required = false) MultipartFile photo,
                                       @RequestPart(value = "postCollection") PostCollectionDTO postCollectionDTO) {
        if(photo != null && !photo.isEmpty()) {
            postCollectionService.updateImage(photo, postCollectionDTO.getCreatedById());
        }
        postCollectionService.update(postCollectionDTO.getCreatedById(), postCollectionDTO);
        return ResponseEntity.ok(postCollectionDTO.getId());
    }

}
