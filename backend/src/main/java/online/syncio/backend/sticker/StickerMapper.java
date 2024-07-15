package online.syncio.backend.sticker;

import lombok.RequiredArgsConstructor;
import online.syncio.backend.exception.NotFoundException;
import online.syncio.backend.stickergroup.StickerGroup;
import online.syncio.backend.stickergroup.StickerGroupRepository;
import online.syncio.backend.user.User;
import online.syncio.backend.user.UserRepository;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class StickerMapper {

    private final StickerGroupRepository stickerGroupRepository;
    private final UserRepository userRepository;


    public StickerDTO mapToDTO(final Sticker sticker, final StickerDTO stickerDTO) {
        stickerDTO.setId(sticker.getId());
        stickerDTO.setName(sticker.getName());
        stickerDTO.setCreatedDate(sticker.getCreatedDate());
        stickerDTO.setFlag(sticker.getFlag());
        stickerDTO.setCreatedBy(sticker.getCreatedBy().getId());
        stickerDTO.setStickerGroupId(sticker.getStickerGroup().getId());
        stickerDTO.setImageUrl("stickers/" + sticker.getId() + ".jpg");
        return stickerDTO;
    }


    public Sticker mapToEntity(final StickerDTO stickerDTO, final Sticker sticker) {
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
