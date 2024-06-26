package online.syncio.backend.billing;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class BillingDTO {
    private UUID labelId;
    private UUID userId;
    private String orderNo;
    private Double amount;
    private StatusEnum status;
    private LocalDateTime createdDate;
}
