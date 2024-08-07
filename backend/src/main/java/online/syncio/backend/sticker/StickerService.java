package online.syncio.backend.sticker;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import online.syncio.backend.exception.AppException;
import online.syncio.backend.exception.NotFoundException;
import online.syncio.backend.utils.FileUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StickerService {

    private final StickerRepository stickerRepository;
    private final StickerMapper stickerMapper;
    private final FileUtils fileUtils;

    @Value("${firebase.storage.type}")
    private String storageType;


    public List<StickerDTO> findAll() {
        final List<Sticker> stickers = stickerRepository.findAll(Sort.by("createdDate"));
        return stickers.stream()
                .map(sticker -> stickerMapper.mapToDTO(sticker, new StickerDTO()))
                .toList();
    }


    public List<StickerDTO> findByStickerGroupIdAndFlagTrue(final Long stickerGroupId) {
        final List<Sticker> stickers = stickerRepository.findByStickerGroupIdAndFlagTrueOrderByCreatedDateDesc(stickerGroupId);
        return stickers.stream()
                .map(sticker -> stickerMapper.mapToDTO(sticker, new StickerDTO()))
                .toList();
    }


    public StickerDTO get(final UUID id) {
        return stickerRepository.findById(id)
                .map(sticker -> stickerMapper.mapToDTO(sticker, new StickerDTO()))
                .orElseThrow(() -> new NotFoundException(Sticker.class, "id", id.toString()));
    }


    public List<StickerDTO> findByStickerGroupId(final Long stickerGroupId) {
        return stickerRepository.findByStickerGroupIdOrderByCreatedDateDesc(stickerGroupId)
                .stream()
                .map(sticker -> stickerMapper.mapToDTO(sticker, new StickerDTO()))
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
        stickerMapper.mapToEntity(stickerDTO, sticker);
        return stickerRepository.save(sticker).getId();
    }


    public void update(final UUID id, final StickerDTO stickerDTO) {
        final Sticker sticker = stickerRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(Sticker.class, "id", id.toString()));
        stickerMapper.mapToEntity(stickerDTO, sticker);
        stickerRepository.save(sticker);
    }


    @Transactional
    public String uploadPhoto(final MultipartFile photo) {
        try {
            String filePath = fileUtils.storeFile(photo, "stickers", false);
            String fileName = filePath.replace("stickers/", "");
            int lastIndexOfDot = fileName.lastIndexOf(".");
            if (lastIndexOfDot != -1) {
                return fileName.substring(0, lastIndexOfDot);
            }
        } catch (IOException e) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Could not save photo: " + photo.getOriginalFilename(), e);
        }
        return null;
    }

}
