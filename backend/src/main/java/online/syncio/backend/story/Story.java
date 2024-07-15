package online.syncio.backend.story;

import jakarta.persistence.*;
import lombok.Data;
import online.syncio.backend.storyview.StoryView;
import online.syncio.backend.user.User;
import org.hibernate.annotations.GenericGenerator;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Table(name = "story")
@Entity
@EntityListeners(AuditingEntityListener.class)
@Data
public class Story {
    @Id
    @Column(nullable = false, updatable = false)
    @GenericGenerator(name = "uuid", strategy = "org.hibernate.id.UUIDGenerator")
    @GeneratedValue(generator = "uuid")
    private UUID id;

    private String photoURL;

    @Column
    @CreatedDate
    private LocalDateTime createdDate;

    @Column(nullable = false)
    private Boolean flag;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @CreatedBy
    private User createdBy;

//    StoryView
    @OneToMany(mappedBy = "story")
    private Set<StoryView> views;

    public String getPhotoURL() {
        return "stories/" + photoURL;
    }
}
