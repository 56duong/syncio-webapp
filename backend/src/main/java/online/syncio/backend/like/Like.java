package online.syncio.backend.like;

import jakarta.persistence.*;
import lombok.Data;
import online.syncio.backend.idclass.PkUserPost;
import online.syncio.backend.post.Post;
import online.syncio.backend.user.User;

@Entity
@Table(name = "likes")
@IdClass(PkUserPost.class)
@Data
public class Like {
    @Id
    @ManyToOne
    @JoinColumn(name = "post_id")
    private Post post;

    @Id
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}
