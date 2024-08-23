package online.syncio.backend.report;

import jakarta.transaction.Transactional;
import online.syncio.backend.exception.NotFoundException;
import online.syncio.backend.post.Post;
import online.syncio.backend.post.PostRepository;
import online.syncio.backend.user.User;
import online.syncio.backend.user.UserRepository;
import online.syncio.backend.utils.JobQueue;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class ReportService {

    @Value("${url.frontend}")
    public String frontendUrl;
    private final ReportRepository reportRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final RabbitTemplate rabbitTemplate;

    public ReportService(ReportRepository reportRepository, PostRepository postRepository, UserRepository userRepository,RabbitTemplate rabbitTemplate) {
        this.reportRepository = reportRepository;
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.rabbitTemplate = rabbitTemplate;
    }

//    CRUD
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
        postRepository.save(post);

        Report savedReport = reportRepository.save(report);


        if(reportDTO.getReason().equals(ReasonEnum.NUDE)){
            UUID postId = post.getId();
            post.getPhotos().forEach(photo -> sendImageForVerification(String.valueOf(photo.getUrl()), postId));
        }
        return mapToDTO(savedReport, new ReportDTO());
    }
    public void sendImageForVerification(String imageUrl, UUID postId) {
        if (imageUrl != null && !imageUrl.isEmpty()) {
            String firebaseBaseUrl = "https://firebasestorage.googleapis.com/v0/b/syncio-bf6ca.appspot.com/o/";
            String encodedImageUrl = imageUrl.replaceAll("/", "%2F");
            String fullImageUrl = firebaseBaseUrl + encodedImageUrl + "?alt=media" + "?postId=" + postId;;
//            String fullImageUrl = frontendUrl + "api/v1/posts/images/" + imageUrl + "?postId=" + postId;
            try {
                System.out.println("Sending image for verification: " + fullImageUrl);
                rabbitTemplate.convertAndSend(JobQueue.EXCHANGE_CHECKIMAGE_AI, JobQueue.ROUTING_KEY_CHECKIMAGE_AI, fullImageUrl);
            } catch (Exception e) {
                System.out.println("Failed to send image for verification: " + e.getMessage());
            }
        }
    }

    public void update(final UUID postId, final UUID userId, final ReportDTO reportDTO) {
        final Report report = reportRepository.findByPostIdAndUserId(postId, userId)
                .orElseThrow(() -> new NotFoundException(Report.class, "postId", postId.toString(), "userId", userId.toString()));
        mapToEntity(reportDTO, report);
        reportRepository.save(report);
    }

    @Transactional
    public void deleteAllByPostId(UUID postId) {
        if (postRepository.findById(postId).isEmpty()) {
            throw new NotFoundException(Post.class, "id", postId.toString());
        }
        reportRepository.deleteByPostId(postId);
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

    public List<ReportDTO> getByPostId(UUID postId) {
        List<Report> reports = reportRepository.findByPostId(postId);
        return reports.stream()
                .map(report -> mapToDTO(report, new ReportDTO()))
                .toList();
    }
}
