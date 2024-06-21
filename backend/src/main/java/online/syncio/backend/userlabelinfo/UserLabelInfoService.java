package online.syncio.backend.userlabelinfo;

import online.syncio.backend.exception.NotFoundException;
import online.syncio.backend.label.Label;
import online.syncio.backend.label.LabelRepository;
import online.syncio.backend.user.User;
import online.syncio.backend.user.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class UserLabelInfoService {
    private final UserLabelInfoRepository userLabelInfoRepository;
    private final UserRepository userRepository;
    private final LabelRepository labelRepository;

    public UserLabelInfoService(UserLabelInfoRepository userLabelInfoRepository, UserRepository userRepository, LabelRepository labelRepository) {
        this.userLabelInfoRepository = userLabelInfoRepository;
        this.userRepository = userRepository;
        this.labelRepository = labelRepository;
    }

    // Map to DTO
    private UserLabelInfoDTO mapToDTO(final UserLabelInfo userLabelInfo, final UserLabelInfoDTO userLabelInfoDTO) {
        userLabelInfoDTO.setLabelId(userLabelInfo.getLabel().getId());
        userLabelInfoDTO.setUserId(userLabelInfo.getUser().getId());
        userLabelInfoDTO.setIsShow(userLabelInfo.getIsShow());
        return userLabelInfoDTO;
    }

    // Map to Entity
    private UserLabelInfo mapToEntity(final UserLabelInfoDTO userLabelInfoDTO, final UserLabelInfo userLabelInfo) {
        Label label = userLabelInfoDTO.getLabelId() == null ? null : labelRepository.findById(userLabelInfoDTO.getLabelId())
                .orElseThrow(() -> new NotFoundException(Label.class, "id", userLabelInfoDTO.getLabelId().toString()));
        User user = userLabelInfoDTO.getUserId() == null ? null : userRepository.findById(userLabelInfoDTO.getUserId())
                .orElseThrow(() -> new NotFoundException(Label.class, "id", userLabelInfoDTO.getUserId().toString()));

        userLabelInfo.setLabel(label);
        userLabelInfo.setUser(user);
        userLabelInfo.setIsShow(userLabelInfoDTO.getIsShow());
        return userLabelInfo;
    }

    // Find all
    public List<UserLabelInfoDTO> findAll() {
        final List<UserLabelInfo> userLabelInfos = userLabelInfoRepository.findAll();
        return userLabelInfos.stream()
                .map(userLabelInfo -> mapToDTO(userLabelInfo, new UserLabelInfoDTO()))
                .toList();
    }

    public List<UserLabelInfoDTO> findByUserId(final UUID userId) {
        final List<UserLabelInfo> userLabelInfos = userLabelInfoRepository.findByUserId(userId);
        return userLabelInfos.stream()
                .map(userLabelInfo -> mapToDTO(userLabelInfo, new UserLabelInfoDTO()))
                .toList();
    }

    // Create
    public void create(final UserLabelInfoDTO userLabelInfoDTO) {
        final UserLabelInfo userLabelInfo = new UserLabelInfo();
        mapToEntity(userLabelInfoDTO, userLabelInfo);
        userLabelInfoRepository.save(userLabelInfo);
    }

    // update
    public void update(final UserLabelInfoDTO userLabelInfoDTO) {
        final UserLabelInfo userLabelInfo = userLabelInfoRepository.findByLabelIdAndUserId(userLabelInfoDTO.getLabelId(), userLabelInfoDTO.getUserId())
                .orElseThrow(() -> new NotFoundException(UserLabelInfo.class, "labelId", userLabelInfoDTO.getLabelId().toString(), "userId", userLabelInfoDTO.getUserId().toString()));
        mapToEntity(userLabelInfoDTO, userLabelInfo);
        userLabelInfoRepository.save(userLabelInfo);
    }
}
