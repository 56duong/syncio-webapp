package online.syncio.backend.userlabelinfo;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(value = "/api/v1/user-label-infos")
public class UserLabelInfoController {

    private final UserLabelInfoService userLabelInfoService;

    public UserLabelInfoController(UserLabelInfoService userLabelInfoService) {
        this.userLabelInfoService = userLabelInfoService;
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
}
