package online.syncio.backend.story;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface StoryRepository extends JpaRepository<Story, UUID> {
    List<Story> findAllByCreatedBy_IdAndCreatedDateAfterOrderByCreatedDate(UUID userId, LocalDateTime createdDate);

}
