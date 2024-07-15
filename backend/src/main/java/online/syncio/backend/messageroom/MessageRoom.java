package online.syncio.backend.messageroom;

import jakarta.persistence.*;
import lombok.Data;
import online.syncio.backend.messagecontent.MessageContent;
import online.syncio.backend.messageroommember.MessageRoomMember;
import online.syncio.backend.user.User;
import org.hibernate.annotations.GenericGenerator;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "message_room")
@EntityListeners(AuditingEntityListener.class)
@Data
public class MessageRoom {

    @Id
    @Column(nullable = false, updatable = false)
    @GenericGenerator(name = "uuid", strategy = "org.hibernate.id.UUIDGenerator")
    @GeneratedValue(generator = "uuid")
    private UUID id;

    private String name;

    @Column
    @CreatedDate
    private LocalDateTime createdDate;

    @Column(nullable = false, updatable = false)
    private boolean isGroup;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @CreatedBy
    private User createdBy;

//    MessageRoomMember
    @OneToMany(mappedBy = "messageRoom")
    private Set<MessageRoomMember> messageRoomMembers;

//    MessageContent
    @OneToMany(mappedBy = "messageRoom")
    private Set<MessageContent> messageContents;

}
