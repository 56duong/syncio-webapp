package online.syncio.backend.billing;

import jakarta.persistence.*;
import lombok.Data;
import online.syncio.backend.idclass.PkUserLabel;
import online.syncio.backend.label.Label;
import online.syncio.backend.user.User;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "billing")
@Data
@EntityListeners(AuditingEntityListener.class) // tự động xử lý các sự kiện của entity như @CreatedDate
@IdClass(PkUserLabel.class) // sử dụng class PkUserLabel làm khóa chính (khoá chính phức hợp gồm 2 thuộc tính user và label)

public class Billing {
    @Id
    @ManyToOne // 1 label có thể được mua bởi nhiều user
    @JoinColumn(name = "label_id") // tên cột trong bảng billing sẽ là label_id, liên kết tới khóa chính của bảng Label
    private Label label;

    @Id
    @ManyToOne // 1 user có thể mua nhiều label
    @JoinColumn(name = "user_id") // // tên cột trong bảng billing sẽ là user_id, liên kết tới khóa chính của bảng User
    private User user;

    @Column
    private String orderNo;

    @Column
    private Double amount;

    @Column
    @Enumerated(EnumType.STRING)
    private StatusEnum status;

    @Column
    @CreatedDate
    private LocalDateTime createdDate;
}
