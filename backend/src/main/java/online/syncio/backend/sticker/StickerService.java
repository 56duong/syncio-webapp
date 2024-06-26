package online.syncio.backend.sticker;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import online.syncio.backend.exception.AppException;
import online.syncio.backend.exception.NotFoundException;
import online.syncio.backend.stickergroup.StickerGroup;
import online.syncio.backend.stickergroup.StickerGroupRepository;
import online.syncio.backend.user.User;
import online.syncio.backend.user.UserRepository;
import online.syncio.backend.utils.FIleUtils;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Service
@AllArgsConstructor
public class StickerService {
    private final StickerRepository stickerRepository;
    private final StickerGroupRepository stickerGroupRepository;
    private final UserRepository userRepository;



//    CRUD
    public List<StickerDTO> findAll() {
        final List<Sticker> stickers = stickerRepository.findAll(Sort.by("createdDate"));
        return stickers.stream()
                .map(sticker -> mapToDTO(sticker, new StickerDTO()))
                .toList();
    }

    public List<StickerDTO> findByStickerGroupIdAndFlagTrue(final Long stickerGroupId) {
        final List<Sticker> stickers = stickerRepository.findByStickerGroupIdAndFlagTrueOrderByCreatedDateDesc(stickerGroupId);
        return stickers.stream()
                .map(sticker -> mapToDTO(sticker, new StickerDTO()))
                .toList();
    }

    public StickerDTO get(final UUID id) {
        return stickerRepository.findById(id)
                .map(sticker -> mapToDTO(sticker, new StickerDTO()))
                .orElseThrow(() -> new NotFoundException(Sticker.class, "id", id.toString()));
    }

    public List<StickerDTO> findByStickerGroupId(final Long stickerGroupId) {
        return stickerRepository.findByStickerGroupIdOrderByCreatedDateDesc(stickerGroupId)
                .stream()
                .map(sticker -> mapToDTO(sticker, new StickerDTO()))
                .toList();
    }

    @Transactional
    public UUID create(final StickerDTO stickerDTO) {
        // check if sticker with name already exists
        stickerRepository.findByName(stickerDTO.getName())
                .ifPresent(sticker -> {
                    throw new AppException(HttpStatus.BAD_REQUEST, "Sticker with name: " + stickerDTO.getName() + " already exists", null);
                });

        final Sticker sticker = new Sticker();
        mapToEntity(stickerDTO, sticker);
        return stickerRepository.save(sticker).getId();
    }

    public void update(final UUID id, final StickerDTO stickerDTO) {
        final Sticker sticker = stickerRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(Sticker.class, "id", id.toString()));
        mapToEntity(stickerDTO, sticker);
        stickerRepository.save(sticker);
    }

    @Transactional
    public List<String> uploadPhotos(final List<MultipartFile> photos) {
        return photos.stream()
                .map(photo -> {
                    try {
                        return FIleUtils.storeFile(photo).replace(".jpg", "");
                    } catch (IOException e) {
                        throw new RuntimeException("Could not save photo: " + photo.getOriginalFilename());
                    }
                })
                .toList();
    }



//    MAPPER
    private StickerDTO mapToDTO(final Sticker sticker, final StickerDTO stickerDTO) {
        stickerDTO.setId(sticker.getId());
        stickerDTO.setName(sticker.getName());
        stickerDTO.setCreatedDate(sticker.getCreatedDate());
        stickerDTO.setFlag(sticker.getFlag());
        stickerDTO.setCreatedBy(sticker.getCreatedBy().getId());
        stickerDTO.setStickerGroupId(sticker.getStickerGroup().getId());
        stickerDTO.setImageUrl("http://localhost:8080/api/v1/images/" + sticker.getId() + ".jpg");
        return stickerDTO;
    }

    private Sticker mapToEntity(final StickerDTO stickerDTO, final Sticker sticker) {
        sticker.setId(stickerDTO.getId());
        sticker.setName(stickerDTO.getName());
        sticker.setCreatedDate(stickerDTO.getCreatedDate());
        sticker.setFlag(stickerDTO.getFlag());

        final User user = stickerDTO.getCreatedBy() == null ? null : userRepository.findById(stickerDTO.getCreatedBy())
                .orElseThrow(() -> new NotFoundException(User.class, "id", stickerDTO.getCreatedBy().toString()));
        sticker.setCreatedBy(user);

        final StickerGroup stickerGroup = stickerDTO.getStickerGroupId() == null ? null : stickerGroupRepository.findById(stickerDTO.getStickerGroupId())
                .orElseThrow(() -> new NotFoundException(StickerGroup.class, "id", stickerDTO.getStickerGroupId().toString()));
        sticker.setStickerGroup(stickerGroup);

        return sticker;
    }

}
