package online.syncio.backend.billing;

import online.syncio.backend.exception.NotFoundException;
import online.syncio.backend.label.Label;
import online.syncio.backend.label.LabelRepository;
import online.syncio.backend.user.User;
import online.syncio.backend.user.UserRepository;
import online.syncio.backend.utils.AuthUtils;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class BillingService {
    private final BillingRepository billingRepository;
    private final UserRepository userRepository;
    private final LabelRepository labelRepository;

    public BillingService(BillingRepository billingRepository, UserRepository userRepository, LabelRepository labelRepository, AuthUtils authUtils) {
        this.billingRepository = billingRepository;
        this.userRepository = userRepository;
        this.labelRepository = labelRepository;
    }

    // Map to DTO
    private BillingDTO mapToDTO(Billing billing, BillingDTO billingDTO) {
        billingDTO.setBuyerId(billing.getBuyer().getId());
        billingDTO.setOwnerId(billing.getOwner().getId());
        billingDTO.setLabelId(billing.getLabel().getId());
        billingDTO.setOrderNo(billing.getOrderNo());
        billingDTO.setAmount(billing.getAmount());
        billingDTO.setStatus(billing.getStatus());
        billingDTO.setCreatedDate(billing.getCreatedDate());
        return billingDTO;
    }

    // Map to Entity
    private Billing mapToEntity(BillingDTO billingDTO, Billing billing) {
        final User buyer = billingDTO.getBuyerId() == null ? null : userRepository.findById(billingDTO.getBuyerId())
                .orElseThrow(() -> new NotFoundException(User.class, "id", billingDTO.getBuyerId().toString()));

        final User owner = billingDTO.getOwnerId() == null ? null : userRepository.findById(billingDTO.getOwnerId())
                .orElseThrow(() -> new NotFoundException(User.class, "id", billingDTO.getOwnerId().toString()));

        final Label label = billingDTO.getLabelId() == null ? null : labelRepository.findById(billingDTO.getLabelId())
                .orElseThrow(() -> new NotFoundException(Label.class, "id", billingDTO.getLabelId().toString()));

        billing.setBuyer(buyer);
        billing.setOwner(owner);
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

    public List<BillingDTO> findByBuyerId(UUID buyerId) {
        List<Billing> billings = billingRepository.findByBuyerId(buyerId);
        return billings.stream()
                .map(billing -> mapToDTO(billing, new BillingDTO()))
                .toList();
    }
    public BillingDTO findByOrderNo(String orderNo) {
        Billing billing = billingRepository.findByOrderNo(orderNo);
        return mapToDTO(billing, new BillingDTO());
    }

    public void createBilling(BillingDTO billingDTO) {
        Billing billing = new Billing();
        mapToEntity(billingDTO, billing);
        billingRepository.save(billing);
    }

    public void updateBilling(BillingDTO billingDTO) {
        final Billing billing = billingRepository.findByOrderNo(billingDTO.getOrderNo());
        mapToEntity(billingDTO, billing);
        billingRepository.save(billing);
    }
}
