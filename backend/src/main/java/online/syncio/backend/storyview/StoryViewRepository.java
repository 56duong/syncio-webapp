package online.syncio.backend.storyview;

import online.syncio.backend.idclass.PkUserStory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StoryViewRepository extends JpaRepository<StoryView, PkUserStory> {

    Optional<StoryView> findByUserIdAndStoryId(UUID userId, UUID storyId);

    /**
     * Count the number of stories created by a user since a given date
     * @param userId the user id
     * @return the number of stories created by the user
     */
    @Query("SELECT COUNT(s) FROM Story s WHERE s.createdBy.id = :userId AND s.createdDate > :startDate")
    Long countByUserId(UUID userId, LocalDateTime startDate);

    /**
     * Count the number of stories created by a user since a given date that have been viewed
     * @param creatorId the creator id
     * @param viewerId the viewer id
     * @return the number of stories created by the user that have been viewed
     */
    @Query("SELECT COUNT(s) FROM Story s WHERE s.createdBy.id = :creatorId AND s.createdDate > :startDate AND EXISTS (SELECT sv FROM StoryView sv WHERE sv.story.id = s.id AND sv.user.id = :viewerId)")
    Long countByUserIdAndViewed(UUID creatorId, UUID viewerId, LocalDateTime startDate);

}
