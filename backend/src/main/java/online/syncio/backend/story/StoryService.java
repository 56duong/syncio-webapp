package online.syncio.backend.story;

import lombok.AllArgsConstructor;
import online.syncio.backend.exception.AppException;
import online.syncio.backend.storyview.StoryViewRepository;
import online.syncio.backend.user.User;
import online.syncio.backend.utils.AuthUtils;
import online.syncio.backend.utils.FileUtils;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@AllArgsConstructor
public class StoryService {
    private final StoryRepository storyRepository;
    private final StoryViewRepository storyViewRepository;
    private final AuthUtils authUtils;
    private final FileUtils fileUtils;
    private final StoryMapper storyMapper;


    public List<UserStoryDTO> findAllUsersWithAtLeastOneStoryAfterCreatedDate(final LocalDateTime createdDate) {
        final List<User> users = storyRepository.findAllUsersWithAtLeastOneStoryAfterCreatedDate(createdDate);
        final UUID currentUserId = authUtils.getCurrentLoggedInUserId();
        return users.stream()
                .map(user -> storyMapper.mapToUserStoryDTO(user, new UserStoryDTO(), currentUserId))
                .toList();
    }


    public UserStoryDTO findUserWithAtLeastOneStoryAfterCreatedDate(final UUID userId, final LocalDateTime createdDate) {
        final User user = storyRepository.findUserWithAtLeastOneStoryAfterCreatedDate(userId, createdDate);
        final UUID currentUserId = authUtils.getCurrentLoggedInUserId();
        return storyMapper.mapToUserStoryDTO(user, new UserStoryDTO(), currentUserId);
    }


    public List<StoryDTO> findAllByCreatedBy_IdAndCreatedDateAfterOrderByCreatedDate(final UUID userId, final LocalDateTime createdDate) {
        final List<Story> stories = storyRepository.findAllByCreatedBy_IdAndCreatedDateAfterOrderByCreatedDate(userId, createdDate);
        final  UUID viewerId = authUtils.getCurrentLoggedInUserId();
        return stories.stream()
                .map(story -> {
                    StoryDTO storyDTO = storyMapper.mapToDTO(story, new StoryDTO());
                    storyDTO.setViewed(
                            storyViewRepository.findByUserIdAndStoryId(viewerId, story.getId())
                            .isPresent()
                    );
                    return storyDTO;
                })
                .toList();
    }


    public UUID create(final MultipartFile photo) throws IOException {
        // Check if file size is greater than 10MB
        if (photo.getSize() > 10 * 1024 * 1024) {
            throw new AppException(HttpStatus.PAYLOAD_TOO_LARGE, "Image size should be less than 10MB", null);
        }
        // Check if file is an image
        String contentType = photo.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new AppException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Invalid image format", null);
        }

        String photoURL = fileUtils.storeFile(photo, "stories", false);
        Story story = new Story();
        story.setPhotoURL(photoURL);
        story.setFlag(true);

        Story savedStory = storyRepository.save(story);
        return savedStory.getId();
    }

}
