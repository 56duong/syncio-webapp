package online.syncio.backend.notification;

import jakarta.persistence.*;
import lombok.Data;
import online.syncio.backend.idclass.PkTargetActionType;
import online.syncio.backend.user.User;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "notification")
@IdClass(PkTargetActionType.class)
@EntityListeners(AuditingEntityListener.class)
@Data
public class Notification {

    /**
     * The entity (post or user) that the action was performed on. Example: when a user comments on a post, the targetId will be the id of the post.
     */
    @Id
    private UUID targetId;

    /**
     * The id of the action that was performed. Example: when a user comments on a post, the actionPerformedId will be the id of the comment.
     */
    private UUID actionPerformedId;

    /**
     * The latest user who performed the action.
     */
    @ManyToOne
    @JoinColumn(name = "actor_id")
    private User actor;

    @Id
    @Enumerated(EnumType.STRING)
    private ActionEnum actionType;

    private String redirectURL;

    @CreatedDate
    private LocalDateTime createdDate;

    @Enumerated(EnumType.STRING)
    private StateEnum state = StateEnum.UNSEEN;

    /**
     * The user who is supposed to receive the notification.
     */
    @ManyToOne
    @JoinColumn(name = "recipient_id")
    private User recipient;

}
