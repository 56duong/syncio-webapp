package online.syncio.backend.report;

import online.syncio.backend.idclass.PkUserPost;
import online.syncio.backend.post.Post;
import online.syncio.backend.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReportRepository extends JpaRepository<Report, PkUserPost> {

    Report findFirstByPost(Post post);

    Report findFirstByUser(User user);

    Optional<Report> findByPostIdAndUserId(UUID postId, UUID userId);

}
