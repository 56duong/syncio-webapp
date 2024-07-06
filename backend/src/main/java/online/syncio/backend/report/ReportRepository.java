package online.syncio.backend.report;

import online.syncio.backend.idclass.PkUserPost;
import online.syncio.backend.post.Post;
import online.syncio.backend.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReportRepository extends JpaRepository<Report, PkUserPost> {

    Report findFirstByPost(Post post);

    Report findFirstByUser(User user);

    Optional<Report> findByPostIdAndUserId(UUID postId, UUID userId);

    @Query("SELECT r FROM Report r WHERE r.post.id = :postId")
    List<Report> findByPostId(@Param("postId") UUID postId);

    void deleteByPostId(UUID postId);
}
