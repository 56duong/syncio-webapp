package online.syncio.backend.story;

import lombok.RequiredArgsConstructor;
import online.syncio.backend.exception.AppException;
import online.syncio.backend.exception.NotFoundException;
import online.syncio.backend.user.User;
import online.syncio.backend.user.UserRepository;
import online.syncio.backend.utils.FIleUtils;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StoryService {
    private final StoryRepository storyRepository;
    private final UserRepository userRepository;


    //    CRUD
    public List<StoryDTO> findAllByCreatedBy_IdAndCreatedDateAfterOrderByCreatedDate(final UUID userId, final LocalDateTime createdDate) {
        final List<Story> stories = storyRepository.findAllByCreatedBy_IdAndCreatedDateAfterOrderByCreatedDate(userId, createdDate);
        return stories.stream()
                .map(story -> mapToDTO(story, new StoryDTO()))
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

        String photoURL = FIleUtils.storeFile(photo);
        Story story = new Story();
        story.setPhotoURL(photoURL);
        story.setFlag(true);

        Story savedStory = storyRepository.save(story);
        return savedStory.getId();
    }


//    MAPPER
    private StoryDTO mapToDTO(final Story story, final StoryDTO storyDTO) {
        storyDTO.setId(story.getId());
        storyDTO.setPhotoURL(story.getPhotoURL());
        storyDTO.setCreatedDate(story.getCreatedDate());
        storyDTO.setFlag(story.getFlag());
        storyDTO.setCreatedBy(story.getCreatedBy().getId());
        return storyDTO;
    }

    private Story mapToEntity(final StoryDTO storyDTO, final Story story) {
        story.setPhotoURL(storyDTO.getPhotoURL());
        story.setCreatedDate(storyDTO.getCreatedDate());
        story.setFlag(storyDTO.getFlag());
        final User user = storyDTO.getCreatedBy() == null ? null : userRepository.findById(storyDTO.getCreatedBy())
                .orElseThrow(() -> new NotFoundException(User.class, "id", storyDTO.getCreatedBy().toString()));
        story.setCreatedBy(user);
        return story;
    }

}
