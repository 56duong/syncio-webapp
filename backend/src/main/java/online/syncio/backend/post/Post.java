package online.syncio.backend.post;

import jakarta.persistence.*;
import lombok.Data;
import online.syncio.backend.comment.Comment;
import online.syncio.backend.like.Like;
import online.syncio.backend.post.photo.Photo;
import online.syncio.backend.postcollectiondetail.PostCollectionDetail;
import online.syncio.backend.report.Report;
import online.syncio.backend.user.User;
import org.hibernate.annotations.GenericGenerator;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

@Table(name = "post")
@Entity
@EntityListeners({AuditingEntityListener.class, PostListener.class})
@Data
public class Post {
    @Id
    @Column(nullable = false, updatable = false)
    @GenericGenerator(name = "uuid", strategy = "org.hibernate.id.UUIDGenerator")
    @GeneratedValue(generator = "uuid")
    private UUID id;

    @Column(columnDefinition = "text")
    private String caption;

    private String audioURL;

    @Column
    @CreatedDate
    private LocalDateTime createdDate;

    @Column(nullable = false)
    private Boolean flag;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @CreatedBy
    private User createdBy;

    private String keywords; // comma separated

//    Photo
    @OneToMany(mappedBy = "post", fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    private List<Photo> photos;

//    Like
    @OneToMany(mappedBy = "post")
    private Set<Like> likes;

//    Comment
    @OneToMany(mappedBy = "post")
    private Set<Comment> comments;

//    Report
    @OneToMany(mappedBy = "post")
    private Set<Report> reports;

//   Visibility
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private PostEnum visibility;

//    Collection Detail
    @OneToMany(mappedBy = "post")
    private Set<PostCollectionDetail> postCollectionDetails;

    public String getAudioURL() {
        if (audioURL == null) return null;
        return "posts/" + audioURL;
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Post post = (Post) o;
        return Objects.equals(id, post.id);
    }
    @Override
    public String toString() {
        return "Post{" +
                "id=" + id +
                ", caption='" + caption + '\'' +
                ", createdDate=" + createdDate +
                '}';
    }
}
