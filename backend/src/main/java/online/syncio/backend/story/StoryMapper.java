package online.syncio.backend.story;

import lombok.RequiredArgsConstructor;
import online.syncio.backend.exception.NotFoundException;
import online.syncio.backend.storyview.StoryViewRepository;
import online.syncio.backend.user.User;
import online.syncio.backend.user.UserRepository;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class StoryMapper {

    private final UserRepository userRepository;
    private final StoryViewRepository storyViewRepository;


    public UserStoryDTO mapToUserStoryDTO (final User user, final UserStoryDTO userStoryDTO, final UUID currentUserId) {
        userStoryDTO.setId(user.getId());
        userStoryDTO.setUsername(user.getUsername());
        userStoryDTO.setStoryCount(storyViewRepository.countByUserId(user.getId(), LocalDateTime.now().minusDays(1)));
        if(currentUserId == null) {
            userStoryDTO.setStoryViewedCount(0L);
        }
        else {
            userStoryDTO.setStoryViewedCount(storyViewRepository.countByUserIdAndViewed(user.getId(), currentUserId, LocalDateTime.now().minusDays(1)));
        }
        return userStoryDTO;
    }


    public StoryDTO mapToDTO(final Story story, final StoryDTO storyDTO) {
        storyDTO.setId(story.getId());
        storyDTO.setPhotoURL(story.getPhotoURL());
        storyDTO.setCreatedDate(story.getCreatedDate());
        storyDTO.setFlag(story.getFlag());
        storyDTO.setCreatedBy(story.getCreatedBy().getId());
        return storyDTO;
    }


    public Story mapToEntity(final StoryDTO storyDTO, final Story story) {
        story.setPhotoURL(storyDTO.getPhotoURL());
        story.setCreatedDate(storyDTO.getCreatedDate());
        story.setFlag(storyDTO.getFlag());
        final User user = storyDTO.getCreatedBy() == null ? null : userRepository.findById(storyDTO.getCreatedBy())
                .orElseThrow(() -> new NotFoundException(User.class, "id", storyDTO.getCreatedBy().toString()));
        story.setCreatedBy(user);
        return story;
    }

}
