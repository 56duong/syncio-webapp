package online.syncio.backend.payment.VNPay;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import online.syncio.backend.auth.responses.ResponseObject;
import online.syncio.backend.billing.Billing;
import online.syncio.backend.billing.BillingDTO;
import online.syncio.backend.billing.BillingService;
import online.syncio.backend.billing.StatusEnum;
import online.syncio.backend.label.LabelService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/payment")
public class VNPayController {
    private final VNPayService vnpayService;
    private final BillingService billingService;
    @PostMapping("/create-payment")
    public ResponseEntity<?> createVNPayPayment(HttpServletRequest request){
        return ResponseEntity.ok(vnpayService.createVNPayPayment(request));
    }

    @GetMapping("/vnpay-callback")
    public void vnpayCallbackHandler(HttpServletRequest request, HttpServletResponse response) throws IOException {
        vnpayService.vnpayCallbackHandler(request, response);
    }
}
