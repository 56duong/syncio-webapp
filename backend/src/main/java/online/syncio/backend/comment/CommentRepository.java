package online.syncio.backend.comment;

import online.syncio.backend.post.Post;
import online.syncio.backend.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface CommentRepository extends JpaRepository<Comment, UUID> {

    Comment findFirstByPost(Post post);

    Comment findFirstByUser(User user);

    List<Comment> findByPostId(UUID postId);

    List<Comment> findByPostIdAndParentCommentId(UUID postId, UUID parentCommentId);

    List<Comment> findByPostIdAndParentCommentIsNull(UUID postId);

    Long countByPostId(UUID postId);

    Long countByPostIdAndParentCommentId(UUID postId, UUID parentCommentId);

    Long countByUserAndCreatedDateAfter(User user, LocalDateTime date);
}
