package online.syncio.backend.comment;

import online.syncio.backend.post.Post;
import online.syncio.backend.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CommentRepository extends JpaRepository<Comment, UUID> {

    Comment findFirstByPost(Post post);

    Comment findFirstByUser(User user);

    List<Comment> findByPostId(UUID postId);

    List<Comment> findByPostIdAndParentCommentId(UUID postId, UUID parentCommentId);

    List<Comment> findByPostIdAndParentCommentIsNullOrderByCreatedDateDesc(UUID postId);

    Long countByPostId(UUID postId);

    Long countByPostIdAndParentCommentId(UUID postId, UUID parentCommentId);

    /**
     * Count how many different users have commented on a specified post
     * @param postId
     * @return
     */
    @Query("SELECT COUNT(DISTINCT c.user) FROM Comment c WHERE c.post.id = :postId")
    Long countDistinctUsersByPostId(UUID postId);

    Long countByUserAndCreatedDateAfter(User user, LocalDateTime date);

    @Query("SELECT COUNT(c) FROM Comment c WHERE c.post IN :posts")
    long countCommentsForPosts(@Param("posts") List<Post> posts);

    @Query("SELECT c.text FROM Comment c WHERE c.id = :id")
    Optional<String> getTextById(UUID id);

}
