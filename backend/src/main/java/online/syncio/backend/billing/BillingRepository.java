package online.syncio.backend.billing;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BillingRepository extends JpaRepository<Billing, UUID>{
    @Query("SELECT b FROM Billing b WHERE b.orderNo = :orderNo")
    Billing findByOrderNo(String orderNo);

    List<Billing> findByBuyerId(UUID buyerId);
}
