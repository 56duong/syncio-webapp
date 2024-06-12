package online.syncio.backend.commentlike;

import online.syncio.backend.idclass.PkUserCommentLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CommentLikeRepository extends JpaRepository<CommentLike, PkUserCommentLike> {

    Optional<CommentLike> findByCommentIdAndUserId(UUID commentId, UUID userId);

    Long countByCommentId(UUID commentId);

}
