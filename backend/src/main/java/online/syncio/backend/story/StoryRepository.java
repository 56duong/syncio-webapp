package online.syncio.backend.story;

import online.syncio.backend.user.StatusEnum;
import online.syncio.backend.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
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
    List<Story> findAllByCreatedBy_IdAndCreatedBy_StatusAndCreatedDateAfterOrderByCreatedDate(UUID userId, StatusEnum status, LocalDateTime createdDate);

    @Query("SELECT u FROM User u JOIN u.stories s WHERE s.createdDate > :createdDate AND u.status = 'ACTIVE'")
    List<User> findAllUsersWithAtLeastOneStoryAfterCreatedDate(LocalDateTime createdDate);

    @Query("SELECT u FROM User u JOIN u.stories s WHERE s.createdDate > :createdDate AND u.id = :userId AND u.status = 'ACTIVE'")
    User findUserWithAtLeastOneStoryAfterCreatedDate(UUID userId, LocalDateTime createdDate);

}
