package online.syncio.backend.story;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface StoryRepository extends JpaRepository<Story, UUID> {
    /**
     * Find all stories created by a user after a certain date
     * @param userId the user id
     * @param createdDate the date
     * @return a list of stories
     * @param userId
     * @param createdDate
     * @return
     */
    List<Story> findAllByCreatedBy_IdAndCreatedDateAfterOrderByCreatedDate(UUID userId, LocalDateTime createdDate);

}
