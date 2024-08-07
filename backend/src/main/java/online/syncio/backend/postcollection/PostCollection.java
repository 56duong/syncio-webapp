package online.syncio.backend.postcollection;

import jakarta.persistence.*;
import lombok.Data;
import online.syncio.backend.postcollectiondetail.PostCollectionDetail;
import online.syncio.backend.user.User;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "post_collection")
@EntityListeners(AuditingEntityListener.class)
@Data
public class PostCollection {
    @Id
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(nullable = false, length = 255)
    private String name;

    @Column(columnDefinition = "text", length = 2000)
    private String description;

    @CreatedDate
    private LocalDateTime createdDate;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private PostCollectionEnum status = PostCollectionEnum.PUBLIC;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @CreatedBy
    private User createdBy;

    @OneToMany(mappedBy = "postCollection")
    private Set<PostCollectionDetail> postCollectionDetails;

}
