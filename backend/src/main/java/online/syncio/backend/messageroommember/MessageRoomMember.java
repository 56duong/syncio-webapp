package online.syncio.backend.messageroommember;

import jakarta.persistence.*;
import lombok.Data;
import online.syncio.backend.idclass.PkUserMessageRoom;
import online.syncio.backend.messageroom.MessageRoom;
import online.syncio.backend.user.User;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "message_room_member")
@IdClass(PkUserMessageRoom.class)
@EntityListeners(AuditingEntityListener.class)
@Data
public class MessageRoomMember {
    @Id
    @ManyToOne
    @JoinColumn(name = "message_room_id")
    private MessageRoom messageRoom;

    @Id
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column
    @CreatedDate
    private LocalDateTime dateJoined;

    @Column(nullable = false)
    private boolean isAdmin;

    private LocalDateTime lastSeen;

}