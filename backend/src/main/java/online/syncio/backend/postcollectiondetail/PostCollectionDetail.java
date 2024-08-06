package online.syncio.backend.postcollectiondetail;

import jakarta.persistence.*;
import lombok.Data;
import online.syncio.backend.post.Post;
import online.syncio.backend.postcollection.PostCollection;
import online.syncio.backend.user.User;
import org.hibernate.annotations.GenericGenerator;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "post_collection_detail")
@EntityListeners(AuditingEntityListener.class)
@Data
public class PostCollectionDetail {
    @Id
    @Column(nullable = false, updatable = false)
    @GenericGenerator(name = "uuid", strategy = "org.hibernate.id.UUIDGenerator")
    @GeneratedValue(generator = "uuid")
    private UUID id;

    @CreatedDate
    private LocalDateTime createdDate;

    @ManyToOne
    @JoinColumn(name = "post_id")
    private Post post;

    @ManyToOne
    @JoinColumn(name = "collection_id")
    private PostCollection postCollection;
}
