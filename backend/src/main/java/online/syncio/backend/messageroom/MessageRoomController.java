package online.syncio.backend.messageroom;

import jakarta.validation.Valid;
import online.syncio.backend.exception.ReferencedException;
import online.syncio.backend.exception.ReferencedWarning;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(value = "/api/v1/messagerooms")
public class MessageRoomController {

    private final MessageRoomService messageRoomService;

    public MessageRoomController(final MessageRoomService messageRoomService) {
        this.messageRoomService = messageRoomService;
    }

    @GetMapping
    public ResponseEntity<List<MessageRoomDTO>> getAllMessageRooms() {
        return ResponseEntity.ok(messageRoomService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MessageRoomDTO> getMessageRoom(@PathVariable(name = "id") final UUID id) {
        return ResponseEntity.ok(messageRoomService.get(id));
    }

    @PostMapping
    public ResponseEntity<UUID> createMessageRoom(@RequestBody @Valid final MessageRoomDTO messageRoomDTO) {
        final UUID createdId = messageRoomService.create(messageRoomDTO);
        return new ResponseEntity<>(createdId, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UUID> updateMessageRoom(@PathVariable(name = "id") final UUID id,
                                           @RequestBody @Valid final MessageRoomDTO messageRoomDTO) {
        messageRoomService.update(id, messageRoomDTO);
        return ResponseEntity.ok(id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMessageRoom(@PathVariable(name = "id") final UUID id) {
        final ReferencedWarning referencedWarning = messageRoomService.getReferencedWarning(id);
        if (referencedWarning != null) {
            throw new ReferencedException(referencedWarning);
        }
        messageRoomService.delete(id);
        return ResponseEntity.noContent().build();
    }

}
