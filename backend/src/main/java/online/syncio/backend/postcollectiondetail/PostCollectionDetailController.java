package online.syncio.backend.postcollectiondetail;

import lombok.AllArgsConstructor;
import online.syncio.backend.post.PostDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping(value = "${api.prefix}/postcollectiondetails")
@AllArgsConstructor
public class PostCollectionDetailController {

    private final PostCollectionDetailService postCollectionDetailService;


    @GetMapping("/{id}")
    public ResponseEntity<Set<PostDTO>> findByCollectionId(@PathVariable final UUID id) {
        final Set<PostDTO> postCollectionDTOs = postCollectionDetailService.findByCollectionId(id);
        return ResponseEntity.ok(postCollectionDTOs);
    }

}
