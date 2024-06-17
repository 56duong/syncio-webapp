package online.syncio.backend.label;

import online.syncio.backend.billing.BillingRepository;
import online.syncio.backend.exception.NotFoundException;
import online.syncio.backend.user.User;
import online.syncio.backend.user.UserRepository;
import online.syncio.backend.userlabelinfo.UserLabelInfoRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
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
        labelDTO.setCreatedDate(label.getCreatedDate());
        labelDTO.setCreatedBy(label.getCreatedBy().getId());
        return labelDTO;
    }

    // MAP LabelDTO -> Label
    private Label mapToEntity(final LabelDTO labelDTO, final Label label) {
        label.setName(labelDTO.getName());
        label.setDescription(labelDTO.getDescription());
        label.setPrice(labelDTO.getPrice());
        label.setCreatedDate(labelDTO.getCreatedDate());
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

    public LabelDTO get(final UUID id){
        return labelRepository.findById(id)
                .map(label -> mapToDTO(label, new LabelDTO()))
                .orElseThrow(() -> new NotFoundException(Label.class, "id", id.toString()));
    }

    public void update (final UUID id, final LabelDTO labelDTO){
        final Label label = labelRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(Label.class, "id", id.toString()));
        labelRepository.save(mapToEntity(labelDTO, label));
    }

    public void delete(final UUID id){
        final Label label = labelRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(Label.class, "id", id.toString()));
        labelRepository.delete(label);
    }
}
