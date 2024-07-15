package online.syncio.backend.stickergroup;

import lombok.AllArgsConstructor;
import online.syncio.backend.exception.NotFoundException;
import online.syncio.backend.user.User;
import online.syncio.backend.user.UserRepository;
import org.springframework.stereotype.Component;

@Component
@AllArgsConstructor
public class StickerGroupMapper {

    private final UserRepository userRepository;


    public StickerGroupDTO mapToDTO(final StickerGroup stickerGroup, final StickerGroupDTO stickerGroupDTO) {
        stickerGroupDTO.setId(stickerGroup.getId());
        stickerGroupDTO.setName(stickerGroup.getName());
        stickerGroupDTO.setCreatedDate(stickerGroup.getCreatedDate());
        stickerGroupDTO.setFlag(stickerGroup.getFlag());
        stickerGroupDTO.setCreatedBy(stickerGroup.getCreatedBy().getId());
        return stickerGroupDTO;
    }

    public StickerGroup mapToEntity(final StickerGroupDTO stickerGroupDTO, final StickerGroup stickerGroup) {
        stickerGroup.setName(stickerGroupDTO.getName());
        stickerGroup.setCreatedDate(stickerGroupDTO.getCreatedDate());
        stickerGroup.setFlag(stickerGroupDTO.getFlag());

        final User user = stickerGroupDTO.getCreatedBy() == null ? null : userRepository.findById(stickerGroupDTO.getCreatedBy())
                .orElseThrow(() -> new NotFoundException(User.class, "id", stickerGroupDTO.getCreatedBy().toString()));
        stickerGroup.setCreatedBy(user);

        return stickerGroup;
    }

}
