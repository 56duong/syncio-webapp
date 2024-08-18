package online.syncio.backend.postcollectiondetail;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PostCollectionDetailRepository extends JpaRepository<PostCollectionDetail, UUID> {

    @Query(value = "SELECT DISTINCT pcd.*, ucf.user_id AS ucf_user_id " +
        "FROM post_collection_detail pcd " +
            "INNER JOIN post p ON pcd.post_id = p.id " +
            "LEFT JOIN user_close_friend ucf ON p.user_id = ucf.user_id " +
        "WHERE pcd.collection_id = :collectionId " +
            "AND p.flag = true " +
            "AND (p.user_id = :currentUserId " +
                "OR p.visibility = 'PUBLIC' " +
                "OR (p.visibility = 'CLOSE_FRIENDS' AND ucf.close_friend_id = :currentUserId) " +
                "OR (p.visibility = 'PRIVATE' AND p.user_id = :currentUserId)) " +
        "ORDER BY pcd.created_date DESC", nativeQuery = true)
    List<PostCollectionDetail> findByUserIdAndVisibility(UUID collectionId, UUID currentUserId);

    List<PostCollectionDetail> findByPostId(UUID postId);
}
