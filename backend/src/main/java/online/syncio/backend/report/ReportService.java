package online.syncio.backend.report;

import lombok.RequiredArgsConstructor;
import online.syncio.backend.exception.NotFoundException;
import online.syncio.backend.post.Post;
import online.syncio.backend.post.PostRepository;
import online.syncio.backend.user.User;
import online.syncio.backend.user.UserRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReportService {
    private final ReportRepository reportRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    //CRUD
    public List<ReportDTO> findAll() {
        final List<Report> reports = reportRepository.findAll(Sort.by("createdDate"));
        return reports.stream()
                .map(report -> mapToDTO(report, new ReportDTO()))
                .toList();
    }

    public ReportDTO create(ReportDTO reportDTO) {
        Report report = mapToEntity(reportDTO, new Report());
        report.setCreatedDate(LocalDateTime.now());

        // set flag of post to false
        Post post = report.getPost();
        post.setFlag(false);
        postRepository.save(post);

        Report savedReport = reportRepository.save(report);

        return mapToDTO(savedReport, new ReportDTO());
    }

    public void update(final UUID postId, final UUID userId, final ReportDTO reportDTO) {
        final Report report = reportRepository.findByPostIdAndUserId(postId, userId)
                .orElseThrow(() -> new NotFoundException(Report.class, "postId", postId.toString(), "userId", userId.toString()));
        mapToEntity(reportDTO, report);
        reportRepository.save(report);
    }

    public void delete(final UUID postId, final UUID userId) {
        final Report report = reportRepository.findByPostIdAndUserId(postId, userId)
                .orElseThrow(() -> new NotFoundException(Report.class, "postId", postId.toString(), "userId", userId.toString()));
        reportRepository.delete(report);
    }

//    MAPPER
    private ReportDTO mapToDTO(final Report report, final ReportDTO reportDTO) {
        reportDTO.setPostId(report.getPost().getId());
        reportDTO.setUserId(report.getUser().getId());
        reportDTO.setCreatedDate(report.getCreatedDate());
        reportDTO.setReason(report.getReason());
        reportDTO.setDescription(report.getDescription());
        return reportDTO;
    }

    private Report mapToEntity(ReportDTO reportDTO, Report report) {
        final Post post = reportDTO.getPostId() == null ? null : postRepository.findById(reportDTO.getPostId())
                .orElseThrow(() -> new NotFoundException(Post.class, "id", reportDTO.getPostId().toString()));
        report.setPost(post);
        final User user = reportDTO.getPostId() == null ? null : userRepository.findById(reportDTO.getUserId())
                .orElseThrow(() -> new NotFoundException(User.class, "id", reportDTO.getUserId().toString()));
        report.setUser(user);
        report.setCreatedDate(reportDTO.getCreatedDate());
        report.setReason(reportDTO.getReason());
        report.setDescription(reportDTO.getDescription());
        return report;
    }
}
