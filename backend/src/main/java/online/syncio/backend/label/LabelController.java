package online.syncio.backend.label;

import jakarta.validation.Valid;
import org.hibernate.validator.cfg.defs.UUIDDef;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
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

    @GetMapping("/buy")
    public ResponseEntity<List<LabelResponseDTO>> getLabelsWithPurchaseStatus(@RequestParam final UUID user_id) {
        List<LabelResponseDTO> labels =  labelService.getAllLabelWithPurcharseStatus(user_id);
        return ResponseEntity.ok(labels);
    }

    @GetMapping("/buyed")
    public ResponseEntity<List<LabelResponseDTO>> getLabelsUserPurchase(@RequestParam final UUID user_id) {
        List<LabelResponseDTO> labels =  labelService.getAllLabelUserPurchased(user_id);
        return ResponseEntity.ok(labels);
    }

    @GetMapping("/{id}")
    public ResponseEntity<LabelDTO> getLabel(@PathVariable(name = "id") final UUID id) {
        return ResponseEntity.ok(labelService.get(id));
    }

    @PostMapping(consumes = {MediaType.MULTIPART_FORM_DATA_VALUE}, produces = {MediaType.APPLICATION_JSON_VALUE})
    public ResponseEntity<?> createLabel(
            @Validated
            @RequestPart("file") final MultipartFile file,
            @RequestPart final LabelDTO labelDTO) throws IOException {
        LabelUploadRequest labelUploadRequest = new LabelUploadRequest(file, labelDTO);
        return ResponseEntity.ok(labelService.create(labelUploadRequest));
    }

    @PutMapping(value = "/{id}", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE}, produces = {MediaType.APPLICATION_JSON_VALUE})
    public ResponseEntity<?> updateLabel(
            @PathVariable(name = "id") final UUID id,
            @RequestPart(name = "file", required = false) final MultipartFile file,
            @RequestPart @Valid final LabelDTO labelDTO) throws IOException {

        LabelUploadRequest labelUploadRequest = new LabelUploadRequest(file, labelDTO);

        return ResponseEntity.ok(labelService.update(id, labelUploadRequest));
    }
}
