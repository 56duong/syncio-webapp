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
     * Check if there is any story created by 'creatorId' since 'startDate' that has not been seen by 'viewerId'
     * @param creatorId the creator id
     * @param viewerId the viewer id
     * @param startDate the start date from which to check for unseen stories
     * @return true if there is any unseen story, false otherwise
     */
    @Query("SELECT COUNT(s) > 0 FROM Story s WHERE s.createdBy.id = :creatorId AND s.createdDate > :startDate AND NOT EXISTS (SELECT sv FROM StoryView sv WHERE sv.story.id = s.id AND sv.user.id = :viewerId)")
    boolean hasUnseenStoriesFromCreatorSinceDate(UUID creatorId, UUID viewerId, LocalDateTime startDate);

}
