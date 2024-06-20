package online.syncio.backend.billing;

import online.syncio.backend.exception.AppException;
import online.syncio.backend.exception.NotFoundException;
import online.syncio.backend.label.Label;
import online.syncio.backend.label.LabelRepository;
import online.syncio.backend.user.User;
import online.syncio.backend.user.UserRepository;
import online.syncio.backend.utils.AuthUtils;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class BillingService {
    private final BillingRepository billingRepository;
    private final UserRepository userRepository;
    private final LabelRepository labelRepository;
    private final AuthUtils authUtils;

    public BillingService(BillingRepository billingRepository, UserRepository userRepository, LabelRepository labelRepository, AuthUtils authUtils) {
        this.billingRepository = billingRepository;
        this.userRepository = userRepository;
        this.labelRepository = labelRepository;
        this.authUtils = authUtils;
    }

    // Map to DTO
    private BillingDTO mapToDTO(Billing billing, BillingDTO billingDTO) {
        billingDTO.setUserId(billing.getUser().getId());
        billingDTO.setLabelId(billing.getLabel().getId());
        billingDTO.setOrderNo(billing.getOrderNo());
        billingDTO.setAmount(billing.getAmount());
        billingDTO.setStatus(billing.getStatus());
        billingDTO.setCreatedDate(billing.getCreatedDate());
        return billingDTO;
    }

    // Map to Entity
    private Billing mapToEntity(BillingDTO billingDTO, Billing billing) {
        final User user = billingDTO.getUserId() == null ? null : userRepository.findById(billingDTO.getUserId())
                .orElseThrow(() -> new NotFoundException(User.class, "id", billingDTO.getUserId().toString()));
        final Label label = billingDTO.getLabelId() == null ? null : labelRepository.findById(billingDTO.getLabelId())
                .orElseThrow(() -> new NotFoundException(Label.class, "id", billingDTO.getLabelId().toString()));
        billing.setUser(user);
        billing.setLabel(label);
        billing.setOrderNo(billingDTO.getOrderNo());
        billing.setStatus(billingDTO.getStatus());
        billing.setAmount(billingDTO.getAmount());
        billing.setCreatedDate(billingDTO.getCreatedDate());
        return billing;
    }

    // Crud
    public List<BillingDTO> findAll(){
        List<Billing> billings = billingRepository.findAll(Sort.by("createdDate"));
        return billings.stream()
                .map(billing -> mapToDTO(billing, new BillingDTO()))
                .toList();
    }

    public Billing findByOrderNo(String orderNo) {
        return billingRepository.findByOrderNo(orderNo);
    }

    public void createBilling(BillingDTO billingDTO) {
        UUID currentLoggedInUserId = authUtils.getCurrentLoggedInUserId();

        // Not logged in
        if (currentLoggedInUserId == null) {
            throw new AppException(HttpStatus.FORBIDDEN, "You must be logged in to buy a label", null);
        }

        billingDTO.setUserId(currentLoggedInUserId);
        Billing billing = new Billing();
        mapToEntity(billingDTO, billing);
        billingRepository.save(billing);
    }

    public void updateBilling(Billing billing) {
        billingRepository.save(billing);
    }
}
