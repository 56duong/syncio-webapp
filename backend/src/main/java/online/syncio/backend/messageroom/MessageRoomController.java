package online.syncio.backend.messageroom;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import online.syncio.backend.utils.AuthUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping(value = "${api.prefix}/messagerooms")
@AllArgsConstructor
public class MessageRoomController {

    private final MessageRoomService messageRoomService;
    private final SimpMessagingTemplate simpMessagingTemplate;
    private final AuthUtils authUtils;


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
     * Create message room with users also check if the room already exists with the same users and return it.
     * If the room is a group, send the message room to all users.
     * @param userIds List of user ids
     * @return MessageRoomDTO
     */
    @PostMapping("/create")
    public ResponseEntity<MessageRoomDTO> createMessageRoomWithUsers(@RequestBody @Valid final Set<UUID> userIds) {
        final MessageRoomDTO messageRoomDTO = messageRoomService.createMessageRoomWithUsers(userIds);
        if(messageRoomDTO.isGroup()) {
            userIds.forEach(userId -> {
                String messageRoomName = messageRoomService.convertMessageRoomName(messageRoomDTO.getId(), userId);
                MessageRoomDTO sendToUser = messageRoomDTO;
                sendToUser.setName(messageRoomName);
                sendToUser.setUnSeenCount(1L);
                simpMessagingTemplate.convertAndSendToUser(userId.toString(), "/queue/newMessageRoom", sendToUser);
            });
        }
        return new ResponseEntity<>(messageRoomDTO, HttpStatus.CREATED);
    }


    /**
     * Send the message created to the room. Use when the room only has 2 members and send the first message to the other user.
     * To append the room to the message room list of the receiver in real-time.
     * @param messageRoomId MessageRoom id
     * @param userId User id
     * @return MessageContentDTO
     */
    @PostMapping("/send-first-message-to-user/{userId}/{messageRoomId}")
    public ResponseEntity<Void> sendFirstMessage(@PathVariable(name = "userId") final UUID userId,
                                                 @PathVariable(name = "messageRoomId") final UUID messageRoomId) {
        final MessageRoomDTO messageRoomDTO = messageRoomService.get(messageRoomId);
        messageRoomDTO.setName(messageRoomService.convertMessageRoomName(messageRoomId, userId));
        messageRoomDTO.setUnSeenCount(1L);
        // send to the receiver
        simpMessagingTemplate.convertAndSendToUser(userId.toString(), "/queue/newMessageRoomNotGroup", messageRoomDTO);
        // send to the sender
        UUID senderId = authUtils.getCurrentLoggedInUserId();
        simpMessagingTemplate.convertAndSendToUser(senderId.toString(), "/queue/newMessageRoomNotGroup", messageRoomDTO);
        return new ResponseEntity<>(HttpStatus.OK);
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
