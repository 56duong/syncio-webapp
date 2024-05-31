package online.syncio.backend.userlabelinfo;

import jakarta.persistence.*;
import lombok.Data;
import online.syncio.backend.idclass.PkUserLabel;
import online.syncio.backend.label.Label;
import online.syncio.backend.user.User;

@Entity
@Table(name = "user_label_info")
@Data
@IdClass(PkUserLabel.class)
public class UserLabelInfo {
    @Id
    @ManyToOne // 1 label có thể thuộc nhiều user
    @JoinColumn(name = "label_id") // tên cột trong bảng user_label_info sẽ là label_id, liên kết tới khóa chính của bảng Label
    private Label label;

    @Id
    @ManyToOne // 1 user có thể có nhiều label
    @JoinColumn(name = "user_id") // tên cột trong bảng user_label_info sẽ là user_id, liên kết tới khóa chính của bảng User
    private User user;

    @Column(name = "is_show")
    private Boolean isShow;
}
