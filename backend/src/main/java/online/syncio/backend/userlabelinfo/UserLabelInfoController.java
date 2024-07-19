package online.syncio.backend.userlabelinfo;

import jakarta.validation.Valid;
import online.syncio.backend.label.Label;
import online.syncio.backend.label.LabelDTO;
import online.syncio.backend.label.LabelResponseDTO;
import online.syncio.backend.label.LabelService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping(value = "/api/v1/user-label-infos")
public class UserLabelInfoController {

    private final UserLabelInfoService userLabelInfoService;
    private final LabelService labelService;

    public UserLabelInfoController(UserLabelInfoService userLabelInfoService, LabelService labelService) {
        this.userLabelInfoService = userLabelInfoService;
        this.labelService = labelService;
    }

    @GetMapping
    public ResponseEntity<List<UserLabelInfoDTO>> getAllUserLabelInfos() {
        return ResponseEntity.ok(userLabelInfoService.findAll());
    }

    @PostMapping
    public ResponseEntity<Void> createUserLabelInfo(@RequestBody @Valid UserLabelInfoDTO userLabelInfoDTO){
        userLabelInfoService.create(userLabelInfoDTO);

        return new ResponseEntity<>(HttpStatus.CREATED);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<ULIResponseDTO>> getUserLabelInfo(@PathVariable(name = "userId") final UUID userId) {
        List<UserLabelInfoDTO> userLabelInfoDTO = userLabelInfoService.findByUserId(userId); // all

        List<ULIResponseDTO> list = new ArrayList<>();
        for (UserLabelInfoDTO labelInfoDTO : userLabelInfoDTO) {
            LabelDTO label = labelService.get(labelInfoDTO.getLabelId());
            ULIResponseDTO apply = new ULIResponseDTO(labelInfoDTO, label.getName(), label.getLabelURL());
            list.add(apply);
        }

        return list.isEmpty() ? ResponseEntity.noContent().build() : ResponseEntity.ok(list);
    }

    @PutMapping("/update-isShow")
    public ResponseEntity<String> updateIsShow(
            @RequestParam UUID userId,
            @RequestParam(required = false) UUID curLabelId,
            @RequestParam UUID newLabelId) {
        userLabelInfoService.updateIsShow(userId, curLabelId, newLabelId);
        String newLabelURL = userLabelInfoService.getLabelURLForUser(userId);

        return ResponseEntity.ok(newLabelURL);
    }

    @GetMapping("/labelURL")
    public String getLabelURLForUser(@RequestParam UUID userId) {
        return userLabelInfoService.getLabelURLForUser(userId);
    }

    @GetMapping("/show")
    public ResponseEntity<UserLabelInfoDTO> getShowUserLabelInfo(
            @RequestParam UUID userId) {
        return ResponseEntity.ok(userLabelInfoService.findUserLabelInfoIsShow(userId));
    }
}
