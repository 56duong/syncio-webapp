package online.syncio.backend.messagecontent;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(value = "/api/v1/messagecontents")
public class MessageContentController {

    private final MessageContentService messageContentService;

    public MessageContentController(final MessageContentService messageContentService) {
        this.messageContentService = messageContentService;
    }

    @GetMapping
    public ResponseEntity<List<MessageContentDTO>> getAllMessageContents() {
        return ResponseEntity.ok(messageContentService.findAll());
    }

    @GetMapping("/{messageRoomId}")
    public ResponseEntity<List<MessageContentDTO>> getMessageContents(@PathVariable(name = "messageRoomId") final UUID messageRoomId) {
        return ResponseEntity.ok(messageContentService.findByMessageRoomId(messageRoomId));
    }

    @PostMapping
    public ResponseEntity<UUID> createMessageContent(@RequestBody @Valid final MessageContentDTO messageContentDTO) {
        final UUID createdId = messageContentService.create(messageContentDTO);
        return new ResponseEntity<>(createdId, HttpStatus.CREATED);
    }

}
