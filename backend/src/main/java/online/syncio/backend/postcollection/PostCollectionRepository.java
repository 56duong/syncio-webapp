package online.syncio.backend.postcollection;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PostCollectionRepository extends JpaRepository<PostCollection, UUID> {

    @Query("SELECT pc FROM PostCollection pc WHERE pc.createdBy.id = :userId AND pc.createdBy.status = 'ACTIVE' ORDER BY pc.createdDate DESC")
    List<PostCollection> findByCreatedByIdAndCreatedByIsActiveOrderByCreatedDateDesc(@Param("userId") UUID userId);

    @Query("SELECT pc FROM PostCollection pc JOIN pc.postCollectionDetails pcd WHERE pcd.post.id = :postId AND pc.createdBy.id = :userId")
    List<PostCollection> findByPostIdAndCreatedById(@Param("postId") UUID postId, @Param("userId") UUID userId);

    @Query("SELECT pc FROM PostCollection pc WHERE pc.id = :id AND pc.createdBy.status = 'ACTIVE'")
    Optional<PostCollection> findByIdAndCreatedByIsActive(@Param("id") UUID id);

}
