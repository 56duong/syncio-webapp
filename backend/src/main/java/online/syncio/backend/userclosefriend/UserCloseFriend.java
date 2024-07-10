package online.syncio.backend.userclosefriend;

import jakarta.persistence.*;
import lombok.Data;
import online.syncio.backend.idclass.PkUserUser;
import online.syncio.backend.user.User;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@Table(name = "user_close_friend")
@IdClass(PkUserUser.class)
@EntityListeners(AuditingEntityListener.class)
@Data
public class UserCloseFriend {
    /**
     * The target user that is being close-friended
     */
    @Id
    @ManyToOne
    @JoinColumn(name = "close_friend_id", nullable = false)
    private User target;

    /**
     * The actor user that performs the close-friending
     */
    @Id
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User actor;
}
