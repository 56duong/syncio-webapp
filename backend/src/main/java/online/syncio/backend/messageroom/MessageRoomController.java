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
    public ResponseEntity<List<MessageRoomDTO>> findAll() {
        return ResponseEntity.ok(messageRoomService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MessageRoomDTO> getMessageRoom(@PathVariable(name = "id") final UUID id) {
        return ResponseEntity.ok(messageRoomService.get(id));
    }

    /**
     * Find all rooms with at least one message content and user id
     * @param userId User id to search
     * @return List of MessageRoomDTO
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<MessageRoomDTO>> findAllRoomsWithContentAndUser(@PathVariable(name = "userId") final UUID userId) {
        return ResponseEntity.ok(messageRoomService.findAllRoomsWithContentAndUser(userId));
    }

    /**
     * Find exact room with members
     * @param userIds List of user ids
     * @return MessageRoomDTO
     */
    @GetMapping("/exists")
    public ResponseEntity<MessageRoomDTO> findExactRoomWithMembers(@RequestParam(name = "userIds") final List<UUID> userIds) {
        return ResponseEntity.ok(messageRoomService.findExactRoomWithMembers(userIds));
    }

    @PostMapping
    public ResponseEntity<UUID> createMessageRoom(@RequestBody @Valid final MessageRoomDTO messageRoomDTO) {
        final UUID createdId = messageRoomService.create(messageRoomDTO);
        return new ResponseEntity<>(createdId, HttpStatus.CREATED);
    }

    /**
     * Create message room with users also check if the room already exists with the same users and return it
     * @param userIds List of user ids
     * @return MessageRoomDTO
     */
    @PostMapping("/create")
    public ResponseEntity<MessageRoomDTO> createMessageRoomWithUsers(@RequestBody @Valid final List<UUID> userIds) {
        final MessageRoomDTO messageRoomDTO = messageRoomService.createMessageRoomWithUsers(userIds);
        return new ResponseEntity<>(messageRoomDTO, HttpStatus.CREATED);
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
