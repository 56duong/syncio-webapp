package online.syncio.backend.comment;

import jakarta.persistence.*;
import lombok.Data;
import online.syncio.backend.commentlike.CommentLike;
import online.syncio.backend.post.Post;
import online.syncio.backend.user.User;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.LazyCollection;
import org.hibernate.annotations.LazyCollectionOption;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
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
    @CreatedBy
    private User user;

    @ManyToOne
    @JoinColumn(name = "parent_comment_id")
    private Comment parentComment;

    @OneToMany(mappedBy = "parentComment", cascade = CascadeType.ALL)
    private List<Comment> replies;

//    CommentLike
    @OneToMany(mappedBy = "comment")
    @LazyCollection(LazyCollectionOption.EXTRA)
    private Set<CommentLike> commentLikes;
}
