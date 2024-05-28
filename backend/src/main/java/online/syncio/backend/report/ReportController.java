package online.syncio.backend.report;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("${api.prefix}/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping
    public ResponseEntity<List<ReportDTO>> getAllReports() {
        return ResponseEntity.ok(reportService.findAll());
    }

    @PostMapping
    public ResponseEntity<ReportDTO> createReport(@RequestBody @Valid ReportDTO reportDTO) {
        ReportDTO createdReport = reportService.create(reportDTO);
        return new ResponseEntity<>(createdReport, HttpStatus.CREATED);
    }

}
