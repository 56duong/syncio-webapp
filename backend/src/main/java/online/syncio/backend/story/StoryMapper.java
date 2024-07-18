package online.syncio.backend.story;

import lombok.RequiredArgsConstructor;
import online.syncio.backend.exception.NotFoundException;
import online.syncio.backend.user.User;
import online.syncio.backend.user.UserRepository;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class StoryMapper {

    private final UserRepository userRepository;

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
