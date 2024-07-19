package online.syncio.backend.storyview;

import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

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
