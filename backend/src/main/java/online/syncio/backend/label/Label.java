package online.syncio.backend.label;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import lombok.Data;
import online.syncio.backend.billing.Billing;
import online.syncio.backend.user.User;
import online.syncio.backend.userlabelinfo.UserLabelInfo;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "label")
@Data
@EntityListeners(AuditingEntityListener.class) // tự động xử lý các sự kiện của entity như @CreatedDate
public class Label implements Serializable {
    @Id
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column
    private String description;

    @Column
    @Min(value = 0, message = "Price should not be less than 0")
    private Long price;

    @Column
    private String labelURL;

    @Column
    @CreatedDate
    private LocalDateTime createdDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @CreatedBy
    private User createdBy;


    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private StatusEnum status;

    // Billing
    @OneToMany(mappedBy = "label")
    private Set<Billing> billings;

    // UserLabelInfo
    @OneToMany(mappedBy = "label")
    private Set<UserLabelInfo> userLabelInfos;

    public String getLabelURL() {
        if(labelURL == null) return null;
        return "labels/" + labelURL;
    }

}
