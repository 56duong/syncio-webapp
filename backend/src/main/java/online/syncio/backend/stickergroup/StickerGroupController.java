package online.syncio.backend.stickergroup;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(value = "${api.prefix}/stickergroups")
@AllArgsConstructor
public class StickerGroupController {

    private final StickerGroupService stickerGroupService;

    @GetMapping
    public ResponseEntity<List<StickerGroupDTO>> findAll() {
        return ResponseEntity.ok(stickerGroupService.findAll());
    }

    @GetMapping("/flag")
    public ResponseEntity<List<StickerGroupDTO>> findAllByFlagTrue() {
        return ResponseEntity.ok(stickerGroupService.findAllByFlagTrue());
    }

    @GetMapping("/{id}")
    public ResponseEntity<StickerGroupDTO> get(@PathVariable(name = "id") final Long id) {
        return ResponseEntity.ok(stickerGroupService.get(id));
    }

    @PostMapping
    public ResponseEntity<Long> create(@RequestBody @Valid final StickerGroupDTO stickerGroupDTO) {
        final Long createdId = stickerGroupService.create(stickerGroupDTO);
        return new ResponseEntity<>(createdId, HttpStatus.CREATED);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Long> update(@PathVariable final Long id, @RequestBody StickerGroupDTO stickerGroupDTO) {
        stickerGroupService.update(id, stickerGroupDTO);
        return ResponseEntity.ok(stickerGroupDTO.getId());
    }

}
