package online.syncio.backend.messageroommember;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(value = "/api/v1/messageroommembers")
public class MessageRoomMemberController {

    private final MessageRoomMemberService messageRoomMemberService;

    public MessageRoomMemberController(final MessageRoomMemberService messageRoomMemberService) {
        this.messageRoomMemberService = messageRoomMemberService;
    }

    @GetMapping
    public ResponseEntity<List<MessageRoomMemberDTO>> getAllMessageRoomMembers() {
        return ResponseEntity.ok(messageRoomMemberService.findAll());
    }

    @GetMapping("/{messageRoomId}")
    public ResponseEntity<List<MessageRoomMemberDTO>> getMessageRoomMembers(@PathVariable(name = "messageRoomId") final UUID messageRoomId) {
        return ResponseEntity.ok(messageRoomMemberService.findByMessageRoomId(messageRoomId));
    }

    @PostMapping
    public ResponseEntity<UUID> createMessageRoomMember(@RequestBody @Valid final MessageRoomMemberDTO messageRoomMemberDTO) {
        messageRoomMemberService.create(messageRoomMemberDTO);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    @DeleteMapping("/{messageRoomId}/{userId}")
    public ResponseEntity<Void> deleteMessageRoomMember(@PathVariable(name = "messageRoomId") final UUID messageRoomId,
                                                        @PathVariable(name = "userId") final UUID userId) {
        messageRoomMemberService.delete(messageRoomId, userId);
        return ResponseEntity.noContent().build();
    }

}
