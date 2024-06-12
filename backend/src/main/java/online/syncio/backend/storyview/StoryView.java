package online.syncio.backend.storyview;

import jakarta.persistence.*;
import lombok.Data;
import online.syncio.backend.idclass.PkUserStory;
import online.syncio.backend.story.Story;
import online.syncio.backend.user.User;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "story_view")
@IdClass(PkUserStory.class)
@EntityListeners(AuditingEntityListener.class)
@Data
public class StoryView {
    @Id
    @ManyToOne
    @JoinColumn(name = "story_id")
    private Story story;

    @Id
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}


