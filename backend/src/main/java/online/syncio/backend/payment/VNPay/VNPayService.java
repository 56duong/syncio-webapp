package online.syncio.backend.payment.VNPay;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import online.syncio.backend.billing.Billing;
import online.syncio.backend.billing.BillingDTO;
import online.syncio.backend.billing.BillingService;
import online.syncio.backend.billing.StatusEnum;
import online.syncio.backend.userlabelinfo.UserLabelInfo;
import online.syncio.backend.userlabelinfo.UserLabelInfoDTO;
import online.syncio.backend.userlabelinfo.UserLabelInfoService;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VNPayService {
    private final VNPayConfig vnpayConfig;
    private final BillingService billingService;
    private final UserLabelInfoService userLabelInfoService;
    public VNPayDTO.VNPayResponse createVNPayPayment(HttpServletRequest request) {
        long amount = Integer.parseInt(request.getParameter("amount"))*100L;
        String bankCode = request.getParameter("bankCode");
        Map<String, String> vnp_Params = vnpayConfig.getVNPayConfig();
        vnp_Params.put("vnp_Amount", String.valueOf(amount));
        vnp_Params.put("vnp_IpAddr", VNPayUtil.getIpAddress(request));

        if (bankCode != null && !bankCode.isEmpty()) {
            vnp_Params.put("vnp_BankCode", bankCode);
        }

        //build query url
        String queryUrl = VNPayUtil.getPaymentURL(vnp_Params, true);
        String hashData = VNPayUtil.getPaymentURL(vnp_Params, false);
        String vnpSecureHash = VNPayUtil.hmacSHA512(vnpayConfig.getSecretKey(), hashData);
        queryUrl += "&vnp_SecureHash=" + vnpSecureHash;
        String paymentUrl = vnpayConfig.getVnp_PayUrl() + "?" + queryUrl;

        // lay orderinfo de luu vao db voi trang thai dang xu ly
        String orderInfo = vnp_Params.get("vnp_OrderInfo").split(":")[1].trim();

        BillingDTO billingDTO = new BillingDTO();
        UUID labelId = UUID.fromString(request.getParameter("labelID"));
        UUID userId = UUID.fromString(request.getParameter("userID"));
        Double amountDTO = Double.parseDouble(request.getParameter("amount"));

        billingDTO.setLabelId(labelId);
        billingDTO.setUserId(userId);
        billingDTO.setOrderNo(orderInfo);
        billingDTO.setAmount(amountDTO);
        billingDTO.setStatus(StatusEnum.PROCESSING);

        // luu thong tin tam thoi vao db
        billingService.createBilling(billingDTO);

        return VNPayDTO.VNPayResponse.builder()
                .labelID(labelId)
                .userID(userId)
                .OrderNo(orderInfo)
                .amount(amountDTO)
                .code("ok")
                .message("success")
                .paymentURL(paymentUrl).build();
    }

    public void vnpayCallbackHandler (HttpServletRequest request, HttpServletResponse response) throws IOException {
        // lay thong tin tu vnpay gui ve
        // kiem tra xem co phai la giao dich thanh cong hay khong -> resCode == 00
        // neu thanh cong thi cap nhat trang thai cua giao dich trong db
        // neu that bai thi set trang thai cua giao dich trong db la failed
        // chuyen huong ve trang thai thanh cong hoac that bai


        // http://localhost:8080/api/v1/payment/vnpay-callback?
        // vnp_Amount=3500000&vnp_BankCode=VNPAY&vnp_CardType=QRCODE
        // &vnp_OrderInfo=Thanh+toan+don+hang%3A84167769&vnp_PayDate=20240619004107
        // &vnp_ResponseCode=24&vnp_TmnCode=FT91TB2X&vnp_TransactionNo=0&vnp_TransactionStatus=02
        // &vnp_TxnRef=43411746&vnp_SecureHash=560b05309696d951674bbc9309a991b53a1fe35e63fa0f3d09f43c97dd807b6e3ba88809e57cf17f64245c0fd125014733ba6db898ed7293ec2b79f62c39b4c0

        // lay thong tin don hang de update trang thai don hang
        String orderInfo = request.getParameter("vnp_OrderInfo").split(":")[1].trim();
        String responseCode = request.getParameter("vnp_ResponseCode");
        long amount = Long.parseLong(request.getParameter("vnp_Amount"))/100L;
        String payDate = request.getParameter("vnp_PayDate");

        if (responseCode != null && responseCode.equals("00")) {
            // update trang thai don hang
            Billing billing = billingService.findByOrderNo(orderInfo);
            billing.setStatus(StatusEnum.SUCCESS);
            billingService.updateBilling(billing);

            // luu thong tin vao bang user_label_info
            UserLabelInfoDTO userLabelInfoDTO = new UserLabelInfoDTO();
            userLabelInfoDTO.setLabelId(billing.getLabel().getId());
            userLabelInfoDTO.setUserId(billing.getUser().getId());
            userLabelInfoDTO.setIsShow(false);
            userLabelInfoService.create(userLabelInfoDTO);

        } else {
            // that bai -> co the dua phan ra nhieu case khac nhau voi cac resCode khac nhau
            Billing billing = billingService.findByOrderNo(orderInfo);
            billing.setStatus(StatusEnum.FAILED);
            billingService.updateBilling(billing);
        }

        response.sendRedirect("http://localhost:4200/payment-info?responseCode="
                + responseCode + "&orderInfo=" + orderInfo + "&amount=" + amount + "&payDate=" + payDate);
    }
}
