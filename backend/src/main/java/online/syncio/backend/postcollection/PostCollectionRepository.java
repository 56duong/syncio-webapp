package online.syncio.backend.postcollection;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PostCollectionRepository extends JpaRepository<PostCollection, UUID> {

    List<PostCollection> findByCreatedByIdOrderByCreatedDateDesc(UUID userId);

    @Query("SELECT pc FROM PostCollection pc JOIN pc.postCollectionDetails pcd WHERE pcd.post.id = :postId AND pc.createdBy.id = :userId")
    List<PostCollection> findByPostIdAndCreatedById(@Param("postId") UUID postId, @Param("userId") UUID userId);

}
