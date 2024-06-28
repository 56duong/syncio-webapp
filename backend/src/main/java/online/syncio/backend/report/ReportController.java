package online.syncio.backend.report;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import online.syncio.backend.post.Post;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

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
    public ResponseEntity<?> createReport(@RequestBody @Valid ReportDTO reportDTO) {
        ReportDTO createdReport = reportService.create(reportDTO);

        return new ResponseEntity<>(createdReport , HttpStatus.CREATED);
    }


    // get reports by post id
    @GetMapping("/{postId}")
    public ResponseEntity<List<ReportDTO>> getReportsByPostId(@PathVariable(name = "postId") final UUID postId) {
        return ResponseEntity.ok(reportService.getByPostId(postId));
    }

    // delete report
    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> deleteReport(@PathVariable(name = "postId") final UUID postId) {
        reportService.deleteAllByPostId(postId);
        return ResponseEntity.noContent().build();
    }



}
