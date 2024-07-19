package online.syncio.backend.sticker;

import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(value = "${api.prefix}/stickers")
@AllArgsConstructor
public class StickerController {

    private final StickerService stickerService;

    @GetMapping
    public ResponseEntity<List<StickerDTO>> findAll() {
        return ResponseEntity.ok(stickerService.findAll());
    }

    @GetMapping("/{stickerGroupId}/flag")
    public ResponseEntity<List<StickerDTO>> findAllByFlagTrue(@PathVariable(name = "stickerGroupId") final Long stickerGroupId) {
        return ResponseEntity.ok(stickerService.findByStickerGroupIdAndFlagTrue(stickerGroupId));
    }

    @GetMapping("/{stickerGroupId}")
    public ResponseEntity<List<StickerDTO>> findByStickerGroupId(@PathVariable(name = "stickerGroupId") final Long stickerGroupId) {
        return ResponseEntity.ok(stickerService.findByStickerGroupId(stickerGroupId));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UUID> createSticker(@RequestPart("photo") MultipartFile photo,
                                              @RequestPart("sticker") StickerDTO stickerDTO) {
        // Get the file name and set it as the sticker id, cause the sticker id will be used as the file name with .jpg extension
        String fileName = stickerService.uploadPhoto(photo);
        stickerDTO.setId(UUID.fromString(fileName));

        UUID createdId = stickerService.create(stickerDTO);
        return new ResponseEntity<>(createdId, HttpStatus.CREATED);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<UUID> findById(@PathVariable final UUID id,
                                         @RequestBody StickerDTO stickerDTO) {
        stickerService.update(id, stickerDTO);
        return ResponseEntity.ok(stickerDTO.getId());
    }

}
