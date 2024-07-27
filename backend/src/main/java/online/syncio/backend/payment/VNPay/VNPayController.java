package online.syncio.backend.payment.vnpay;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import online.syncio.backend.billing.BillingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

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
