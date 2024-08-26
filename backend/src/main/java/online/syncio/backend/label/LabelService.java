package online.syncio.backend.label;

import lombok.RequiredArgsConstructor;
import online.syncio.backend.exception.AppException;
import online.syncio.backend.exception.NotFoundException;
import online.syncio.backend.user.User;
import online.syncio.backend.user.UserRepository;
import online.syncio.backend.userlabelinfo.UserLabelInfo;
import online.syncio.backend.userlabelinfo.UserLabelInfoRepository;
import online.syncio.backend.utils.AuthUtils;
import online.syncio.backend.utils.FileUtils;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LabelService {
    private final LabelRepository labelRepository;
    private final UserRepository userRepository;;
    private final UserLabelInfoRepository userLabelInfoRepository;
    private final AuthUtils authUtils;
    private final FileUtils fileUtils;
    private final LabelRedisService labelRedisService;

    // MAP Label -> LabelDTO
    private LabelDTO mapToDTO(final Label label, final LabelDTO labelDTO) {
        labelDTO.setId(label.getId());
        labelDTO.setName(label.getName());
        labelDTO.setDescription(label.getDescription());
        labelDTO.setPrice(label.getPrice());
        labelDTO.setLabelURL(label.getLabelURL());
        labelDTO.setCreatedDate(label.getCreatedDate());
        labelDTO.setCreatedBy(label.getCreatedBy() == null ? null : label.getCreatedBy().getId());
        labelDTO.setStatus(label.getStatus());
        return labelDTO;
    }

    // MAP LabelDTO -> Label
    private Label mapToEntity(final LabelDTO labelDTO, final Label label) {
        label.setName(labelDTO.getName());
        label.setDescription(labelDTO.getDescription());
        label.setPrice(labelDTO.getPrice());
        label.setLabelURL(labelDTO.getLabelURL());
        label.setCreatedDate(labelDTO.getCreatedDate());
        label.setStatus(labelDTO.getStatus());

        final User user = labelDTO.getCreatedBy() == null ? null : userRepository.findById(labelDTO.getCreatedBy())
                .orElseThrow(() -> new NotFoundException(User.class, "id", labelDTO.getCreatedBy().toString()));
        label.setCreatedBy(user);

        return label;
    }

    // CRUD

    public List<LabelDTO> findAll(){

//        final List<Label> labels = labelRepository.findAll(Sort.by("createdDate").descending());
////        return labels.stream()
////                .map(label -> mapToDTO(label, new LabelDTO()))
////                .toList();
        List<LabelDTO> labelDTOS = labelRedisService.findALl();
        if (labelDTOS == null) {
            final List<Label> labels = labelRepository.findAll(Sort.by("createdDate").descending());
            labelDTOS = labels.stream()
                    .map(label -> mapToDTO(label, new LabelDTO()))
                    .toList();
            labelRedisService.cacheLabels(labelDTOS);
        }
        return labelDTOS;
    }


    public List<LabelResponseDTO> getAllLabelWithPurcharseStatus(UUID user_id) {
        // lay ra tat ca cac label tu db
        List<Label> labels = labelRepository.findAll();

        Set<UUID> purcharsedLabelIds;

        if(user_id != null) {
            // lay thong tin cac label ma nguoi dung da mua
            List<UserLabelInfo> userLabelInfos = userLabelInfoRepository.findByUserId(user_id);

            // chuyen danh sach UserLabelInfo sang danh sach ID Label ma nguoi dung da mua
            purcharsedLabelIds = userLabelInfos.stream()
                    .map(userLabelInfo -> userLabelInfo.getLabel().getId())
                    .collect(Collectors.toSet());
        }
        else {
            purcharsedLabelIds = new HashSet<>();
        }

        // dem so
        List<UserLabelInfo> listU = userLabelInfoRepository.findAll();
        List<UUID> listID = listU.stream()
                .map(b -> b.getLabel().getId())
                .toList();

        Map<UUID, Integer> countMap = new HashMap<>();

        for (UUID id : listID) {
            countMap.put(id, countMap.getOrDefault(id, 0) + 1);
        }

        // tao danh sach DTO de tra ve, moi DTO chua thong tin label va trang thai mua
        return labels.stream().map(
                label -> {
                    boolean isPurcharse = purcharsedLabelIds.contains(label.getId());
                    int quantitySold = 0;
                    if (countMap.containsKey(label.getId())) {
                        quantitySold = countMap.get(label.getId());
                    }
                    return new LabelResponseDTO(label, isPurcharse, quantitySold);
                }).collect(Collectors.toList());
    }

    private String processUploadedFile(MultipartFile file, Boolean isKeepCurrentName) {
        String fileName = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        List<String> extensions = Arrays.asList(".gif", ".png", ".jpeg", ".jpg", ".bmp", ".webp");
        if (!extensions.contains(fileName.substring(fileName.lastIndexOf(".")))) {
            throw new AppException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Invalid image format", null);
        }
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new AppException(HttpStatus.PAYLOAD_TOO_LARGE, "File size too large", null);
        }
        try {
            // save file
            return fileUtils.storeFile(file, "labels", isKeepCurrentName);
        } catch (IOException e){
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Error occurred while saving file", e);
        }
    }


    /**
     * Get file name from file path. Example: labels/1234-5678-90ab-cdef.jpg -> 1234-5678-90ab-cdef
     * @param filePath
     * @return the file name without extension or path
     */
    private String getFileName(String filePath) {
        // get file name
        String name = filePath.replace("labels/", "");
        int lastIndexOfDot = name.lastIndexOf(".");
        if (lastIndexOfDot != -1) {
            return name.substring(0, lastIndexOfDot);
        }
        return name;
    }


    public LabelDTO create(final LabelUploadRequest labelUploadRequest) throws IOException {
        User user = userRepository.findById(authUtils.getCurrentLoggedInUserId())
                .orElseThrow(() -> new NotFoundException(User.class, "id", labelUploadRequest.labelDTO().getCreatedBy().toString()));

        Label label = new Label();

        if (labelUploadRequest.file() != null) {
            String newFileName = processUploadedFile(labelUploadRequest.file(), false);
            label.setId(UUID.fromString(getFileName(newFileName))); // set id from file name to make the file name as the id
            label.setName(labelUploadRequest.labelDTO().getName());
            label.setPrice(labelUploadRequest.labelDTO().getPrice());
            label.setDescription(labelUploadRequest.labelDTO().getDescription());
            label.setLabelURL(newFileName);
            label.setCreatedBy(user);
            label.setStatus(labelUploadRequest.labelDTO().getStatus());
            labelRepository.save(label);
            labelRedisService.clearByKey("labels");
        }

        return mapToDTO(label, new LabelDTO());
    }

    public LabelDTO get(final UUID id){
        return labelRepository.findById(id)
                .map(label -> mapToDTO(label, new LabelDTO()))
                .orElseThrow(() -> new NotFoundException(Label.class, "id", id.toString()));
    }

    public LabelDTO update (final UUID id, final LabelUploadRequest labelUploadRequest) throws IOException {
        User user = userRepository.findById(authUtils.getCurrentLoggedInUserId())
                .orElseThrow(() -> new NotFoundException(User.class, "id", labelUploadRequest.labelDTO().getCreatedBy().toString()));
        final Label label = labelRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(Label.class, "id", id.toString()));

        // neu co file duoc chon -> co du lieu file
        if (labelUploadRequest.file() != null) {
            String fileName = processUploadedFile(labelUploadRequest.file(), true);
            label.setLabelURL(fileName);
        }

        label.setName(labelUploadRequest.labelDTO().getName());
        label.setPrice(labelUploadRequest.labelDTO().getPrice());
        label.setDescription(labelUploadRequest.labelDTO().getDescription());
        label.setCreatedBy(user);
        label.setStatus(labelUploadRequest.labelDTO().getStatus());
        labelRepository.save(label);
        labelRedisService.clearByKey("label::" + id);
        labelRedisService.clearByKey("labels");
        labelRedisService.clearByKey("labelsWithPurchaseStatus::" + user.getId());
        return mapToDTO(label, new LabelDTO());
    }

    // Check if the user already owns the label or not
    public boolean checkIfUserOwnsLabel(UUID userId, UUID labelId) {
        List<UserLabelInfo> checkOwnerLabel = userLabelInfoRepository.findByUserId(userId);
        Set<UUID> labelIds = checkOwnerLabel.stream()
                .map(userLabelInfo -> userLabelInfo.getLabel().getId())
                .collect(Collectors.toSet());

        return labelIds.contains(labelId);
    }

//    public List<LabelResponseDTO> getAllLabelUserPurchased (UUID user_id) {
//        // lay ra tat ca cac label tu db
//        List<Label> labels = labelRepository.findAll();
//
//        // lay thong tin cac label ma nguoi dung da mua
//        List<UserLabelInfo> userLabelInfos = userLabelInfoRepository.findByUserId(user_id);
//
//        // chuyen danh sach UserLabelInfo sang danh sach ID Label ma nguoi dung da mua
//        Set<UUID> purcharsedLabelIds = userLabelInfos.stream()
//                .map(userLabelInfo -> userLabelInfo.getLabel().getId())
//                .collect(Collectors.toSet());
//
//        // tao danh sach DTO de tra ve, moi DTO chua thong tin label va trang thai mua
//        return labels.stream()
//                .filter(label -> purcharsedLabelIds.contains(label.getId())) // Chỉ lấy các label có trong purchasedLabelIds
//                .map(label -> new LabelResponseDTO(label, true)) // Đánh dấu label đã mua
//                .collect(Collectors.toList());
//    }
}
