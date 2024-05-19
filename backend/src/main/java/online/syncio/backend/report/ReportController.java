package online.syncio.backend.report;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(value = "/api/v1/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(final ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping
    public ResponseEntity<List<ReportDTO>> getAllReports() {
        return ResponseEntity.ok(reportService.findAll());
    }

    @PostMapping
    public ResponseEntity<Void> createReport(@RequestBody @Valid final ReportDTO reportDTO) {
        reportService.create(reportDTO);
        return new ResponseEntity<>(HttpStatus.CREATED);
    }

}
