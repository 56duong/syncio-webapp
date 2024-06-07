package online.syncio.backend.post;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PostRepository extends JpaRepository<Post, UUID> {
    long countByCreatedBy_Id (UUID id);
    /* Find posts which were created by a user with the UUID in createdBy column */
    List<Post> findByCreatedBy_IdOrderByCreatedDateDesc (UUID id);
    Page<Post> findByReportsIsNotNullAndFlagTrue(Pageable pageable);
    Page<Post> findByReportsIsNotNullAndFlagFalse(Pageable pageable);
}
