package online.syncio.backend.userfollow;

import jakarta.persistence.*;
import lombok.Data;
import online.syncio.backend.idclass.PkUserUser;
import online.syncio.backend.user.User;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_follow")
@IdClass(PkUserUser.class)
@EntityListeners(AuditingEntityListener.class)
@Data
public class UserFollow {
    /**
     * The target user that is being followed
     */
    @Id
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User target;

    /**
     * The actor user that performs the following
     */
    @Id
    @ManyToOne
    @JoinColumn(name = "follower_id", nullable = false)
    private User actor;

    @CreatedDate
    private LocalDateTime createdDate;
}
