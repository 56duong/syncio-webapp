package online.syncio.backend.stickergroup;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import online.syncio.backend.exception.AppException;
import online.syncio.backend.exception.NotFoundException;
import online.syncio.backend.user.User;
import online.syncio.backend.user.UserRepository;
import online.syncio.backend.utils.FIleUtils;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
@AllArgsConstructor
public class StickerGroupService {
    private final StickerGroupRepository stickerGroupRepository;
    private final UserRepository userRepository;



//    CRUD
    public List<StickerGroupDTO> findAll() {
        final List<StickerGroup> stickerGroups = stickerGroupRepository.findAll(Sort.by("createdDate"));
        return stickerGroups.stream()
                .map(stickerGroup -> mapToDTO(stickerGroup, new StickerGroupDTO()))
                .toList();
    }

    public List<StickerGroupDTO> findAllByFlagTrue() {
        final List<StickerGroup> stickerGroups = stickerGroupRepository.findAllByFlagTrue();
        return stickerGroups.stream()
                .map(stickerGroup -> mapToDTO(stickerGroup, new StickerGroupDTO()))
                .toList();
    }

    public StickerGroupDTO get(final Long id) {
        return stickerGroupRepository.findById(id)
                .map(stickerGroup -> mapToDTO(stickerGroup, new StickerGroupDTO()))
                .orElseThrow(() -> new NotFoundException(StickerGroup.class, "id", id.toString()));
    }

    public Long create(final StickerGroupDTO stickerGroupDTO) {
        // check if stickerGroup with name already exists
        stickerGroupRepository.findByName(stickerGroupDTO.getName())
                .ifPresent(stickerGroup -> {
                    throw new AppException(HttpStatus.BAD_REQUEST, "StickerGroup with name: " + stickerGroupDTO.getName() + " already exists", null);
                });

        final StickerGroup stickerGroup = new StickerGroup();
        mapToEntity(stickerGroupDTO, stickerGroup);
        return stickerGroupRepository.save(stickerGroup).getId();
    }

    public void update(final Long id, final StickerGroupDTO stickerGroupDTO) {
        final StickerGroup stickerGroup = stickerGroupRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(StickerGroup.class, "id", id.toString()));
        mapToEntity(stickerGroupDTO, stickerGroup);
        stickerGroupRepository.save(stickerGroup);
    }



//    MAPPER
    private StickerGroupDTO mapToDTO(final StickerGroup stickerGroup, final StickerGroupDTO stickerGroupDTO) {
        stickerGroupDTO.setId(stickerGroup.getId());
        stickerGroupDTO.setName(stickerGroup.getName());
        stickerGroupDTO.setCreatedDate(stickerGroup.getCreatedDate());
        stickerGroupDTO.setFlag(stickerGroup.getFlag());
        stickerGroupDTO.setCreatedBy(stickerGroup.getCreatedBy().getId());
        return stickerGroupDTO;
    }

    private StickerGroup mapToEntity(final StickerGroupDTO stickerGroupDTO, final StickerGroup stickerGroup) {
        stickerGroup.setName(stickerGroupDTO.getName());
        stickerGroup.setCreatedDate(stickerGroupDTO.getCreatedDate());
        stickerGroup.setFlag(stickerGroupDTO.getFlag());

        final User user = stickerGroupDTO.getCreatedBy() == null ? null : userRepository.findById(stickerGroupDTO.getCreatedBy())
                .orElseThrow(() -> new NotFoundException(User.class, "id", stickerGroupDTO.getCreatedBy().toString()));
        stickerGroup.setCreatedBy(user);

        return stickerGroup;
    }

}
