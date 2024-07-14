package online.syncio.backend.messageroommember;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(value = "${api.prefix}/messageroommembers")
@AllArgsConstructor
public class MessageRoomMemberController {

    private final MessageRoomMemberService messageRoomMemberService;


    @GetMapping("/{messageRoomId}")
    public ResponseEntity<List<MessageRoomMemberDTO>> getMessageRoomMembers(@PathVariable(name = "messageRoomId") final UUID messageRoomId) {
        return ResponseEntity.ok(messageRoomMemberService.findByMessageRoomId(messageRoomId));
    }


    @PostMapping("/{messageRoomId}")
    public ResponseEntity<List<MessageRoomMemberDTO>> addMessageRoomMembers(@PathVariable(name = "messageRoomId") final UUID messageRoomId,
                                                                            @Valid @RequestBody final List<UUID> userIds) {
        List<MessageRoomMemberDTO> messageRoomMembers = messageRoomMemberService.addMembersToRoom(messageRoomId, userIds);
        return ResponseEntity.status(HttpStatus.CREATED).body(messageRoomMembers);
    }


    @DeleteMapping("/{messageRoomId}/{userId}")
    public ResponseEntity<Void> deleteMessageRoomMember(@PathVariable(name = "messageRoomId") final UUID messageRoomId,
                                                        @PathVariable(name = "userId") final UUID userId) {
        messageRoomMemberService.delete(messageRoomId, userId);
        return ResponseEntity.noContent().build();
    }


    @DeleteMapping("/{messageRoomId}/leave")
    public ResponseEntity<Void> leaveMessageRoom(@PathVariable(name = "messageRoomId") final UUID messageRoomId) {
        messageRoomMemberService.leaveChat(messageRoomId);
        return ResponseEntity.noContent().build();
    }


    /**
     * Check if there are other admins in the room except the current user
     * @param messageRoomId
     * @return true if there are other admins, false otherwise
     */
    @GetMapping("/{messageRoomId}/has-other-admins")
    public ResponseEntity<Boolean> hasOtherAdmins(@PathVariable(name = "messageRoomId") final UUID messageRoomId) {
        return ResponseEntity.ok(messageRoomMemberService.hasOtherAdmins(messageRoomId));
    }


    @PutMapping("/{messageRoomId}/{userId}/make-admin")
    public ResponseEntity<Void> makeAdmin(@PathVariable(name = "messageRoomId") final UUID messageRoomId,
                                          @PathVariable(name = "userId") final UUID userId) {
        messageRoomMemberService.updateAdmin(messageRoomId, userId, true);
        return ResponseEntity.noContent().build();
    }


    @PutMapping("/{messageRoomId}/{userId}/remove-admin")
    public ResponseEntity<Void> removeAdmin(@PathVariable(name = "messageRoomId") final UUID messageRoomId,
                                            @PathVariable(name = "userId") final UUID userId) {
        messageRoomMemberService.updateAdmin(messageRoomId, userId, false);
        return ResponseEntity.noContent().build();
    }


    @PutMapping("/user/{messageRoomId}")
    public ResponseEntity<LocalDateTime> updateLastSeen(@PathVariable(name = "messageRoomId") final UUID messageRoomId) {
        return ResponseEntity.ok(messageRoomMemberService.updateLastSeen(messageRoomId));
    }

}
