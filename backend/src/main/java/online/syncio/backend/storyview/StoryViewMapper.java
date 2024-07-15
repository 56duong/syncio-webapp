package online.syncio.backend.storyview;

import lombok.RequiredArgsConstructor;
import online.syncio.backend.exception.NotFoundException;
import online.syncio.backend.story.Story;
import online.syncio.backend.story.StoryRepository;
import online.syncio.backend.user.User;
import online.syncio.backend.user.UserRepository;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class StoryViewMapper {

    private final StoryRepository storyRepository;
    private final UserRepository userRepository;


    public StoryViewDTO mapToDTO(final StoryView storyView, final StoryViewDTO storyViewDTO) {
        storyViewDTO.setStoryId(storyView.getStory().getId());
        storyViewDTO.setUserId(storyView.getUser().getId());
        return storyViewDTO;
    }


    public StoryView mapToEntity(final StoryViewDTO storyViewDTO, final StoryView storyView) {
        final Story story = storyViewDTO.getStoryId() == null ? null : storyRepository.findById(storyViewDTO.getStoryId())
                .orElseThrow(() -> new NotFoundException(Story.class, "id", storyViewDTO.getStoryId().toString()));
        storyView.setStory(story);

        final User user = storyViewDTO.getUserId() == null ? null : userRepository.findById(storyViewDTO.getUserId())
                .orElseThrow(() -> new NotFoundException(User.class, "id", storyViewDTO.getUserId().toString()));
        storyView.setUser(user);

        return storyView;
    }

}
