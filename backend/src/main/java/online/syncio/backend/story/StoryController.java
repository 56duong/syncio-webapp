package online.syncio.backend.story;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(value = "${api.prefix}/stories")
public class StoryController {

    private final StoryService storyService;

    public StoryController(StoryService storyService) {
        this.storyService = storyService;
    }

    /**
     * Get all stories created by a user in the last 24 hours
     * @param userId the user id
     * @return a list of stories
     */
    @GetMapping("/{userId}")
    public List<StoryDTO> getStories(@PathVariable final UUID userId) {
        return storyService.findAllByCreatedBy_IdAndCreatedDateAfterOrderByCreatedDate(userId, LocalDateTime.now().minusDays(1));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UUID> createPost(@RequestPart(name = "photo") final MultipartFile photo) throws IOException {
        final UUID id = storyService.create(photo);
        return new ResponseEntity<>(id, HttpStatus.CREATED);
    }

}
