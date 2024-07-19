package online.syncio.backend.stickergroup;

import lombok.AllArgsConstructor;
import online.syncio.backend.exception.AppException;
import online.syncio.backend.exception.NotFoundException;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
public class StickerGroupService {
    private final StickerGroupRepository stickerGroupRepository;
    private final StickerGroupMapper stickerGroupMapper;


    public List<StickerGroupDTO> findAll() {
        final List<StickerGroup> stickerGroups = stickerGroupRepository.findAll(Sort.by("createdDate"));
        return stickerGroups.stream()
                .map(stickerGroup -> stickerGroupMapper.mapToDTO(stickerGroup, new StickerGroupDTO()))
                .toList();
    }


    public List<StickerGroupDTO> findAllByFlagTrue() {
        final List<StickerGroup> stickerGroups = stickerGroupRepository.findAllByFlagTrue();
        return stickerGroups.stream()
                .map(stickerGroup -> stickerGroupMapper.mapToDTO(stickerGroup, new StickerGroupDTO()))
                .toList();
    }


    public StickerGroupDTO get(final Long id) {
        return stickerGroupRepository.findById(id)
                .map(stickerGroup -> stickerGroupMapper.mapToDTO(stickerGroup, new StickerGroupDTO()))
                .orElseThrow(() -> new NotFoundException(StickerGroup.class, "id", id.toString()));
    }


    public Long create(final StickerGroupDTO stickerGroupDTO) {
        // check if stickerGroup with name already exists
        stickerGroupRepository.findByName(stickerGroupDTO.getName())
                .ifPresent(stickerGroup -> {
                    throw new AppException(HttpStatus.BAD_REQUEST, "StickerGroup with name: " + stickerGroupDTO.getName() + " already exists", null);
                });

        final StickerGroup stickerGroup = new StickerGroup();
        stickerGroupMapper.mapToEntity(stickerGroupDTO, stickerGroup);
        return stickerGroupRepository.save(stickerGroup).getId();
    }


    public void update(final Long id, final StickerGroupDTO stickerGroupDTO) {
        final StickerGroup stickerGroup = stickerGroupRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(StickerGroup.class, "id", id.toString()));
        stickerGroupMapper.mapToEntity(stickerGroupDTO, stickerGroup);
        stickerGroupRepository.save(stickerGroup);
    }

}
