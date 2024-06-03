package online.syncio.backend.label;

import jakarta.validation.Valid;
import org.hibernate.validator.cfg.defs.UUIDDef;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/labels")
public class LabelController {

    private final LabelService labelService;

    public LabelController(LabelService labelService) {
        this.labelService = labelService;
    }

    @GetMapping
    public ResponseEntity<List<LabelDTO>> getAllLabels() {
        return ResponseEntity.ok(labelService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LabelDTO> getLabel(@PathVariable(name = "id") final UUID id) {
        return ResponseEntity.ok(labelService.get(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UUID> updateLabel(@PathVariable(name = "id") final UUID id,
                                            @RequestBody @Valid final LabelDTO labelDTO) {
        labelService.update(id, labelDTO);
        return ResponseEntity.ok(id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLabel(@PathVariable(name = "id") final UUID id) {
        labelService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
