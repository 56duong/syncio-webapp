package online.syncio.backend.billing;

import jakarta.persistence.*;
import lombok.Data;
import online.syncio.backend.label.Label;
import online.syncio.backend.user.User;
import org.hibernate.annotations.GenericGenerator;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "billing")
@Data
@EntityListeners(AuditingEntityListener.class) // tự động xử lý các sự kiện của entity như @CreatedDate
public class Billing {
    @Id
    @Column(nullable = false, updatable = false)
    @GenericGenerator(name = "uuid", strategy = "org.hibernate.id.UUIDGenerator")
    @GeneratedValue(generator = "uuid")
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "label_id", nullable = false)
    private Label label;

    @ManyToOne
    @JoinColumn(name = "buyer_id", nullable = false)
    private User buyer;

    @ManyToOne
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column
    private String orderNo;

    @Column
    private Long amount;

    @Column
    @Enumerated(EnumType.STRING)
    private StatusEnum status;

    @Column
    @CreatedDate
    private LocalDateTime createdDate;
}
