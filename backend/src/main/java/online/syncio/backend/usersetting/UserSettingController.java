package online.syncio.backend.usersetting;

import lombok.AllArgsConstructor;
import online.syncio.backend.user.UserProfile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping(value = "${api.prefix}/usersettings")
@AllArgsConstructor
public class UserSettingController {

    private final UserSettingService userSettingService;


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
