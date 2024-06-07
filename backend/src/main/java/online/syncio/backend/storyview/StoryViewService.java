package online.syncio.backend.storyview;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import online.syncio.backend.exception.NotFoundException;
import online.syncio.backend.story.Story;
import online.syncio.backend.story.StoryDTO;
import online.syncio.backend.story.StoryRepository;
import online.syncio.backend.user.User;
import online.syncio.backend.user.UserRepository;
import online.syncio.backend.utils.AuthUtils;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

@Service
@AllArgsConstructor
public class StoryViewService {
    private final StoryViewRepository storyViewRepository;
    private final StoryRepository storyRepository;
    private final UserRepository userRepository;
    private final AuthUtils authUtils;

    public void create(StoryViewDTO storyViewDTO) {
        storyViewDTO.setUserId(authUtils.getCurrentLoggedInUserId());
        StoryView storyView = new StoryView();
        mapToEntity(storyViewDTO, storyView);
        storyViewRepository.save(storyView);
    }

    @Transactional
    public void saveAll(final List<StoryViewDTO> storyViewDTOs) {
        final List<StoryView> storyViews = storyViewDTOs.stream()
                .map(storyViewDTO -> {
                    storyViewDTO.setUserId(authUtils.getCurrentLoggedInUserId());
                    final StoryView storyView = new StoryView();
                    mapToEntity(storyViewDTO, storyView);
                    return storyView;
                })
                .toList();
        storyViewRepository.saveAll(storyViews);
    }

    private StoryViewDTO mapToDTO(final StoryView storyView, final StoryViewDTO storyViewDTO) {
        storyViewDTO.setStoryId(storyView.getStory().getId());
        storyViewDTO.setUserId(storyView.getUser().getId());
        return storyViewDTO;
    }

    private StoryView mapToEntity(final StoryViewDTO storyViewDTO, final StoryView storyView) {
        final Story story = storyViewDTO.getStoryId() == null ? null : storyRepository.findById(storyViewDTO.getStoryId())
                .orElseThrow(() -> new NotFoundException(Story.class, "id", storyViewDTO.getStoryId().toString()));
        storyView.setStory(story);

        final User user = storyViewDTO.getUserId() == null ? null : userRepository.findById(storyViewDTO.getUserId())
                        .orElseThrow(() -> new NotFoundException(User.class, "id", storyViewDTO.getUserId().toString()));
        storyView.setUser(user);

        return storyView;
    }
}
