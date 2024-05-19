package online.syncio.backend.comment;

import jakarta.persistence.*;
import lombok.Data;
import online.syncio.backend.post.Post;
import online.syncio.backend.user.User;
import org.hibernate.annotations.GenericGenerator;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "comment")
@EntityListeners(AuditingEntityListener.class)
@Data
public class Comment {
    @Id
    @Column(nullable = false, updatable = false)
    @GenericGenerator(name = "uuid", strategy = "org.hibernate.id.UUIDGenerator")
    @GeneratedValue(generator = "uuid")
    private UUID id;

    @Column
    @CreatedDate
    private LocalDateTime createdDate;

    @Column(nullable = false, length = 500)
    private String text;

    @ManyToOne
    @JoinColumn(name = "post_id")
    private Post post;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}
