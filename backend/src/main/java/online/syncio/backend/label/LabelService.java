package online.syncio.backend.label;

import online.syncio.backend.billing.BillingRepository;
import online.syncio.backend.exception.AppException;
import online.syncio.backend.exception.NotFoundException;
import online.syncio.backend.user.UserRepository;
import online.syncio.backend.userlabelinfo.UserLabelInfoRepository;
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
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
public class LabelService {
    private final LabelRepository labelRepository;
    private final UserRepository userRepository;;
    private final BillingRepository billingRepository;
    private final UserLabelInfoRepository userLabelInfoRepository;

    public LabelService(LabelRepository labelRepository, UserRepository userRepository, BillingRepository billingRepository, UserLabelInfoRepository userLabelInfoRepository) {
        this.labelRepository = labelRepository;
        this.userRepository = userRepository;
        this.billingRepository = billingRepository;
        this.userLabelInfoRepository = userLabelInfoRepository;
    }

    // MAP Label -> LabelDTO
    private LabelDTO mapToDTO(final Label label, final LabelDTO labelDTO) {
        labelDTO.setId(label.getId());
        labelDTO.setName(label.getName());
        labelDTO.setDescription(label.getDescription());
        labelDTO.setPrice(label.getPrice());
        labelDTO.setLabelURL(label.getLabelURL());
        labelDTO.setCreatedDate(label.getCreatedDate());
        //labelDTO.setCreatedBy(label.getCreatedBy().getId());
        return labelDTO;
    }

    // MAP LabelDTO -> Label
    private Label mapToEntity(final LabelDTO labelDTO, final Label label) {
        label.setName(labelDTO.getName());
        label.setDescription(labelDTO.getDescription());
        label.setPrice(labelDTO.getPrice());
        label.setLabelURL(labelDTO.getLabelURL());
        label.setCreatedDate(labelDTO.getCreatedDate());
//        final User user = labelDTO.getCreatedBy() == null ? null : userRepository.findById(labelDTO.getCreatedBy())
//                .orElseThrow(() -> new NotFoundException(User.class, "id", labelDTO.getCreatedBy().toString()));
//        label.setCreatedBy(user);
        return label;
    }

    // CRUD
    public List<LabelDTO> findAll(){
        final List<Label> labels = labelRepository.findAll(Sort.by("createdDate").descending());
        return labels.stream()
                .map(label -> mapToDTO(label, new LabelDTO()))
                .toList();
    }

    public String processUploadedFile(MultipartFile file, String newName) {

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new AppException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Invalid image format", null);
        }

        String fileName = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        if (!fileName.toLowerCase().endsWith(".gif")) {
            throw new AppException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Invalid image format. Only .gif images are supported", null);
        }

        String newFileName = newName + ".gif";
        java.nio.file.Path uploadDir = Paths.get("uploads");

        try {
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }

            java.nio.file.Path destination = Paths.get(uploadDir.toString(), newFileName);
            Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e){
            throw new AppException(HttpStatus.INTERNAL_SERVER_ERROR, "Error occurred while copying", e);
        }

        return newFileName;
    }

    public LabelDTO create(final LabelUploadRequest labelUploadRequest) throws IOException {
        Label label = new Label();

        if (labelUploadRequest.file() != null) {
            String newFileName = processUploadedFile(labelUploadRequest.file(), labelUploadRequest.labelDTO().getName());

            label.setName(labelUploadRequest.labelDTO().getName());
            label.setPrice(labelUploadRequest.labelDTO().getPrice());
            label.setDescription(labelUploadRequest.labelDTO().getDescription());
            label.setLabelURL(newFileName);

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

        labelRepository.save(label);
        return mapToDTO(label, new LabelDTO());
    }

    public void delete(final UUID id){
        final Label label = labelRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(Label.class, "id", id.toString()));
        labelRepository.delete(label);
    }
}
