package online.syncio.backend.like;

import online.syncio.backend.idclass.PkUserPost;
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
public interface LikeRepository extends JpaRepository<Like, PkUserPost> {

    Like findFirstByPost(Post post);

    Like findFirstByUser(User user);

    Optional<Like> findByPostIdAndUserId(UUID postId, UUID userId);

    Long countByPostId(UUID postId);

    @Query("SELECT l FROM Like l WHERE l.post.id = :postId AND l.user.id = :userId")
    Optional<Like> findLikeByPostAndUser(UUID postId, UUID userId);

    @Query("SELECT COUNT(l) FROM Like l WHERE l.user = :user AND l.post.createdDate > :date")
    long countByUserAndPostCreatedDateAfter(@Param("user") User user, @Param("date") LocalDateTime date);

    @Query("SELECT COUNT(l) FROM Like l WHERE l.post IN :posts")
    long countLikesForPosts(@Param("posts") List<Post> posts);
}
