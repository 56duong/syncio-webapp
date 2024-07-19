package online.syncio.backend.label;

import online.syncio.backend.billing.BillingRepository;
import online.syncio.backend.exception.AppException;
import online.syncio.backend.exception.NotFoundException;
import online.syncio.backend.user.User;
import online.syncio.backend.user.UserRepository;
import online.syncio.backend.userlabelinfo.UserLabelInfo;
import online.syncio.backend.userlabelinfo.UserLabelInfoRepository;
import online.syncio.backend.utils.AuthUtils;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class LabelService {
    private final LabelRepository labelRepository;
    private final UserRepository userRepository;;
    private final BillingRepository billingRepository;
    private final UserLabelInfoRepository userLabelInfoRepository;
    private final AuthUtils authUtils;

    public LabelService(LabelRepository labelRepository, UserRepository userRepository, BillingRepository billingRepository, UserLabelInfoRepository userLabelInfoRepository, AuthUtils authUtils) {
        this.labelRepository = labelRepository;
        this.userRepository = userRepository;
        this.billingRepository = billingRepository;
        this.userLabelInfoRepository = userLabelInfoRepository;
        this.authUtils = authUtils;
    }

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
        final List<Label> labels = labelRepository.findAll(Sort.by("createdDate").descending());
        return labels.stream()
                .map(label -> mapToDTO(label, new LabelDTO()))
                .toList();
    }

    public List<LabelResponseDTO> getAllLabelWithPurcharseStatus (UUID user_id) {
        // lay ra tat ca cac label tu db
        List<Label> labels = labelRepository.findAll();

        // lay thong tin cac label ma nguoi dung da mua
        List<UserLabelInfo> userLabelInfos = userLabelInfoRepository.findByUserId(user_id);

        // chuyen danh sach UserLabelInfo sang danh sach ID Label ma nguoi dung da mua
        Set<UUID> purcharsedLabelIds = userLabelInfos.stream()
                .map(userLabelInfo -> userLabelInfo.getLabel().getId())
                .collect(Collectors.toSet());

        // tao danh sach DTO de tra ve, moi DTO chua thong tin label va trang thai mua
        return labels.stream().map(
                label -> {
                    boolean isPurcharse = purcharsedLabelIds.contains(label.getId());
                    return new LabelResponseDTO(label, isPurcharse);
                }).collect(Collectors.toList());
    }

    public String processUploadedFile(MultipartFile file, String newName) {

        String fileName = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));

        List<String> extensions = Arrays.asList(".gif", ".png", ".jpeg", ".jpg", ".bmp", ".webp");
        if (!extensions.contains(fileName.substring(fileName.lastIndexOf(".")))) {
            throw new AppException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Invalid image format", null);
        }
        else {
            fileName = newName + fileName.substring(fileName.lastIndexOf("."));
            System.out.println("old file name: " + file.getOriginalFilename());
            System.out.println("new file name: " + fileName);
            System.out.println("file extension: " + fileName.substring(fileName.lastIndexOf(".")));
        }

        java.nio.file.Path uploadDir = Paths.get("uploads");

        try {
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }

            java.nio.file.Path destination = Paths.get(uploadDir.toString(), fileName);
            Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e){
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Error occurred while copying", e);
        }

        return fileName;
    }

    public LabelDTO create(final LabelUploadRequest labelUploadRequest) throws IOException {
        User user = userRepository.findById(authUtils.getCurrentLoggedInUserId())
                .orElseThrow(() -> new NotFoundException(User.class, "id", labelUploadRequest.labelDTO().getCreatedBy().toString()));
        Label label = new Label();

        if (labelUploadRequest.file() != null) {
            String newFileName = processUploadedFile(labelUploadRequest.file(), labelUploadRequest.labelDTO().getName());

            label.setName(labelUploadRequest.labelDTO().getName());
            label.setPrice(labelUploadRequest.labelDTO().getPrice());
            label.setDescription(labelUploadRequest.labelDTO().getDescription());
            label.setLabelURL(newFileName);
            label.setCreatedBy(user);
            label.setStatus(labelUploadRequest.labelDTO().getStatus());
            System.out.println("user_id neu file != null: " + user.getId());
            labelRepository.save(label);
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
            // xoa file cu
            java.nio.file.Path uploadDir = Paths.get("uploads");
            String oldFileName = uploadDir + "/" +  label.getLabelURL();
            File oldFile = new File(oldFileName);
            if (oldFile.exists()) {
                oldFile.delete();
            }

            // upload file moi
            String newFileName = processUploadedFile(labelUploadRequest.file(), labelUploadRequest.labelDTO().getName());
            label.setLabelURL(newFileName);

        }
        // neu ko co file duoc chon -> ko co du lieu file
        // doi ten file hien tai thanh ten moi
        else {
            String oldFileName = label.getLabelURL(); // test8.gif
            String newFileName = labelUploadRequest.labelDTO().getName() + ".gif"; // test9.gif
            java.nio.file.Path oldFilePath = Paths.get("uploads", oldFileName); // uploads/test8.gif
            java.nio.file.Path newFilePath = Paths.get("uploads", newFileName); // uploads/test9.gif
            Files.move(oldFilePath, newFilePath, StandardCopyOption.REPLACE_EXISTING); // move test8 -> test9

            label.setLabelURL(newFileName);
        }

        label.setName(labelUploadRequest.labelDTO().getName());
        label.setPrice(labelUploadRequest.labelDTO().getPrice());
        label.setDescription(labelUploadRequest.labelDTO().getDescription());
        label.setCreatedBy(user);
        label.setStatus(labelUploadRequest.labelDTO().getStatus());

        labelRepository.save(label);
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
}
