package online.syncio.backend.userlabelinfo;

import online.syncio.backend.exception.NotFoundException;
import online.syncio.backend.label.Label;
import online.syncio.backend.label.LabelDTO;
import online.syncio.backend.label.LabelRepository;
import online.syncio.backend.label.LabelService;
import online.syncio.backend.user.User;
import online.syncio.backend.user.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserLabelInfoService {
    private final UserLabelInfoRepository userLabelInfoRepository;
    private final UserRepository userRepository;
    private final LabelRepository labelRepository;
    private final LabelService labelService;

    public UserLabelInfoService(UserLabelInfoRepository userLabelInfoRepository, UserRepository userRepository, LabelRepository labelRepository, LabelService labelService) {
        this.userLabelInfoRepository = userLabelInfoRepository;
        this.userRepository = userRepository;
        this.labelRepository = labelRepository;
        this.labelService = labelService;
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
    public UserLabelInfoDTO updateIsShow(UUID userId, UUID curLabelId, UUID newLabelId) {
        UserLabelInfo newUserLabelInfo = userLabelInfoRepository.findByLabelIdAndUserId(newLabelId, userId)
                .orElseThrow(() -> new NotFoundException(UserLabelInfo.class, "newLabelId", newLabelId.toString()));

        if (curLabelId != null && curLabelId.equals(newLabelId)) {
            newUserLabelInfo.setIsShow(false);
            userLabelInfoRepository.save(newUserLabelInfo);
        } else {
            // cur to false
            if (curLabelId != null) {
                UserLabelInfo curUserLabelInfo = userLabelInfoRepository.findByLabelIdAndUserId(curLabelId, userId)
                        .orElseThrow(() -> new NotFoundException(UserLabelInfo.class, "curLabelId", curLabelId.toString()));
                curUserLabelInfo.setIsShow(false);
                userLabelInfoRepository.save(curUserLabelInfo);
            }

            // new to true
            newUserLabelInfo.setIsShow(true);
            userLabelInfoRepository.save(newUserLabelInfo);
        }

        return mapToDTO(newUserLabelInfo, new UserLabelInfoDTO());
    }

    public String getLabelURLForUser(UUID userId) {
        // Tìm UserLabelInfo có isShow = true cho userId
        Optional<UserLabelInfo> userLabelInfoOptional = userLabelInfoRepository.findByUserIdAndIsShow(userId, true);

        // Nếu tìm thấy, lấy labelId và từ đó lấy labelURL từ LabelService
        if (userLabelInfoOptional.isPresent()) {
            UUID labelId = userLabelInfoOptional.get().getLabel().getId();
            LabelDTO label = labelService.get(labelId);

            return label.getLabelURL();
        }

        return null; // Hoặc xử lý trường hợp không tìm thấy userLabelInfo
    }

    public UserLabelInfoDTO findUserLabelInfoIsShow(UUID userId) {
        Optional<UserLabelInfo> userLabelInfoOptional = userLabelInfoRepository.findByUserIdAndIsShow(userId, true);

        return userLabelInfoOptional.map(userLabelInfo -> mapToDTO(userLabelInfo, new UserLabelInfoDTO())).orElse(null);
    }
}
