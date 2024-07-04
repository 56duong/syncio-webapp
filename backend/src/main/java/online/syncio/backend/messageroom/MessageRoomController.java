package online.syncio.backend.messageroom;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping(value = "/api/v1/messagerooms")
@AllArgsConstructor
public class MessageRoomController {

    private final MessageRoomService messageRoomService;


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
    public ResponseEntity<MessageRoomDTO> findExactRoomWithMembers(@RequestParam(name = "userIds") final Set<UUID> userIds) {
        return ResponseEntity.ok(messageRoomService.findExactRoomWithMembers(userIds));
    }


    /**
     * Create message room with users also check if the room already exists with the same users and return it
     * @param userIds List of user ids
     * @return MessageRoomDTO
     */
    @PostMapping("/create")
    public ResponseEntity<MessageRoomDTO> createMessageRoomWithUsers(@RequestBody @Valid final Set<UUID> userIds) {
        final MessageRoomDTO messageRoomDTO = messageRoomService.createMessageRoomWithUsers(userIds);
        return new ResponseEntity<>(messageRoomDTO, HttpStatus.CREATED);
    }

    /**
     * Update the name of the room
     * @param id
     * @param payload
     * @return
     */
    @PostMapping("update-name/{id}")
    public ResponseEntity<Map<String, String>> updateName(@PathVariable(name = "id") final UUID id,
                                                          @RequestBody Map<String, Object> payload) {
        final String name = (String) payload.get("name");
        String newName = messageRoomService.updateName(id, name);

        Map<String, String> responseBody = new HashMap<>();
        responseBody.put("name", newName);
        return new ResponseEntity<>(responseBody, HttpStatus.OK);
    }

}
