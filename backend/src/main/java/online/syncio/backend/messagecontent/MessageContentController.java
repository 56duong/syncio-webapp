package online.syncio.backend.messagecontent;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
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

    /**
     * This method is used to send a message content to a specific message room.
     * The @MessageMapping("/messagecontent/{messageRoomId}") annotation means that this method
     * will be invoked when a message is sent to the "/messagecontent/{messageRoomId}" destination.
     * The @SendTo("/topic/messagecontent/{messageRoomId}") annotation means that the return value of this method
     * will be sent to the "/topic/messagecontent/{messageRoomId}" destination.
     * @param messageRoomId the message room id
     * @param messageContentDTO the message content
     * @return the message content
     */
    @MessageMapping("/messagecontent/{messageRoomId}")
    @SendTo("/topic/messagecontent/{messageRoomId}")
    public MessageContentDTO addComment(@DestinationVariable final UUID messageRoomId,
                                 final MessageContentDTO messageContentDTO) {
        final UUID createdId = messageContentService.create(messageContentDTO);
        messageContentDTO.setId(createdId);
        return messageContentDTO;
    }

}
