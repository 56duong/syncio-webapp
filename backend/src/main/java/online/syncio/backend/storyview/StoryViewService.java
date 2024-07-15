package online.syncio.backend.storyview;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import online.syncio.backend.utils.AuthUtils;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class StoryViewService {
    private final StoryViewRepository storyViewRepository;
    private final StoryViewMapper storyViewMapper;
    private final AuthUtils authUtils;


    public void create(StoryViewDTO storyViewDTO) {
        storyViewDTO.setUserId(authUtils.getCurrentLoggedInUserId());
        StoryView storyView = new StoryView();
        storyViewMapper.mapToEntity(storyViewDTO, storyView);
        storyViewRepository.save(storyView);
    }


    @Transactional
    public void saveAll(final List<StoryViewDTO> storyViewDTOs) {
        final List<StoryView> storyViews = storyViewDTOs.stream()
                .map(storyViewDTO -> {
                    storyViewDTO.setUserId(authUtils.getCurrentLoggedInUserId());
                    final StoryView storyView = new StoryView();
                    storyViewMapper.mapToEntity(storyViewDTO, storyView);
                    return storyView;
                })
                .toList();
        storyViewRepository.saveAll(storyViews);
    }

}
