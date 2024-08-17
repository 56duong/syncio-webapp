package online.syncio.backend.usersetting;

import lombok.AllArgsConstructor;
import online.syncio.backend.user.UserProfile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(value = "${api.prefix}/usersettings")
@AllArgsConstructor
public class UserSettingController {

    private final UserSettingService userSettingService;


    @GetMapping
    public ResponseEntity<UserSettingDTO> getUserSetting() {
        final UserSettingDTO userSettingDTO = userSettingService.getUserSetting();
        return ResponseEntity.ok(userSettingDTO);
    }


    @PostMapping("/who-can-add-you-to-group-chat")
    public ResponseEntity<UserSettingDTO> updateWhoCanAddYouToGroupChat(@RequestBody final String whoCanAddYouToGroupChat) {
        // Convert the string to an enum value
        final WhoCanAddYouToGroupChat whoCanAddYouToGroupChatEnum = WhoCanAddYouToGroupChat.valueOf(whoCanAddYouToGroupChat);
        final UserSettingDTO userSettingDTO = userSettingService.updateWhoCanAddYouToGroupChat(whoCanAddYouToGroupChatEnum);
        return ResponseEntity.ok(userSettingDTO);
    }


    @PostMapping("/who-can-send-you-new-message")
    public ResponseEntity<UserSettingDTO> updateWhoCanSendYouNewMessage(@RequestBody final String whoCanSendYouNewMessage) {
        // Convert the string to an enum value
        final WhoCanSendYouNewMessage whoCanSendYouNewMessageEnum = WhoCanSendYouNewMessage.valueOf(whoCanSendYouNewMessage);
        final UserSettingDTO userSettingDTO = userSettingService.updateWhoCanSendYouNewMessage(whoCanSendYouNewMessageEnum);
        return ResponseEntity.ok(userSettingDTO);
    }


    /**
     * Check who can send you a new message in a chat of 2 users.
     * Use in case the message already exists, but have no message content and the current user access the room by the link.
     * @param messageRoomId the message room id
     * @return true if the user can send a new message, otherwise false
     */
    @GetMapping("/check-who-can-send-you-new-message/{messageRoomId}")
    public ResponseEntity<Boolean> checkWhoCanSendYouNewMessage(@PathVariable final UUID messageRoomId) {
        boolean canSend = userSettingService.checkWhoCanSendYouNewMessage(messageRoomId);
        return ResponseEntity.ok(canSend);
    }


    @PostMapping("/update-image-search")
    public ResponseEntity<Void> updateImageSearch(@RequestParam("file") MultipartFile file) {
        userSettingService.updateImageSearch(file);
        return ResponseEntity.ok().build();
    }


    @DeleteMapping("/delete-image-search")
    public ResponseEntity<Boolean> deleteImageSearch() {
        boolean isDeleted = userSettingService.deleteImageSearch();
        return ResponseEntity.ok(isDeleted);
    }


    @PostMapping("/search-by-image")
    public ResponseEntity<List<UserProfile>> searchByImage(@RequestParam("file") MultipartFile file) {
        List<UserProfile> userIds = userSettingService.searchByImage(file);
        return ResponseEntity.ok(userIds);
    }

}
