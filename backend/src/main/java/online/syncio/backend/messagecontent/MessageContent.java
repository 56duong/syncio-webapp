package online.syncio.backend.messagecontent;

import jakarta.persistence.*;
import lombok.Data;
import online.syncio.backend.messageroom.MessageRoom;
import online.syncio.backend.user.User;
import org.hibernate.annotations.GenericGenerator;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "message_content")
@EntityListeners(AuditingEntityListener.class)
@Data
public class MessageContent {
    @Id
    @Column(nullable = false, updatable = false)
    @GenericGenerator(name = "uuid", strategy = "org.hibernate.id.UUIDGenerator")
    @GeneratedValue(generator = "uuid")
    private UUID id;

    @Column(nullable = false, length = 1000)
    private String message;

    @Column
    @CreatedDate
    private LocalDateTime dateSent;

    @Enumerated(EnumType.STRING)
    private TypeEnum type;

    @ManyToOne
    @JoinColumn(name = "message_room_id")
    private MessageRoom messageRoom;

    @ManyToOne
    @JoinColumn(name = "sender_id")
    @CreatedBy
    private User user;

    @ManyToOne
    @JoinColumn(name = "parent_message_content_id")
    private MessageContent parentMessageContent;

    @OneToMany(mappedBy = "parentMessageContent", cascade = CascadeType.ALL)
    private List<MessageContent> replies;

}