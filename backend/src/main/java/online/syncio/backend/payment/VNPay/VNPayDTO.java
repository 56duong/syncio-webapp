package online.syncio.backend.payment.VNPay;

import lombok.Builder;

import java.util.UUID;

public abstract class VNPayDTO {
    @Builder
    public static class VNPayResponse {
        public UUID labelID;
        public UUID userID;
        public String OrderNo;
        public Double amount;
        public String code;
        public String message;
        public String paymentURL;
    }
}
