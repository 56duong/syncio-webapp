package online.syncio.backend.billing;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(value = "/api/v1/billing")
public class BillingConntroller {

    public final BillingService billingService;

    public BillingConntroller(BillingService billingService) {
        this.billingService = billingService;
    }

    @GetMapping
    public ResponseEntity<List<BillingDTO>> getAllBillings() {
        return ResponseEntity.ok(billingService.findAll());
    }

    @PostMapping
    public ResponseEntity<Void> createBilling(@RequestBody @Valid BillingDTO billingDTO) {
        billingService.create(billingDTO);
        return ResponseEntity.ok().build();
    }
}
