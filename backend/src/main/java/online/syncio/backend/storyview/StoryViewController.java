package online.syncio.backend.storyview;

import lombok.AllArgsConstructor;
import online.syncio.backend.story.StoryDTO;
import online.syncio.backend.story.StoryService;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(value = "${api.prefix}/storyviews")
@AllArgsConstructor
public class StoryViewController {

    private final StoryViewService storyViewService;

    @PostMapping
    public ResponseEntity<Void> saveAll(@RequestBody final List<StoryViewDTO> storyViewDTO) {
        storyViewService.saveAll(storyViewDTO);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

}
