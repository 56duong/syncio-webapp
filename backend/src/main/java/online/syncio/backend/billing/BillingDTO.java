package online.syncio.backend.billing;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class BillingDTO {
    private UUID labelId;
    private UUID buyerId;
    private UUID ownerId;
    private String orderNo;
    private Long amount;
    private StatusEnum status;
    private LocalDateTime createdDate;
}
