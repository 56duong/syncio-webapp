package online.syncio.backend.postcollectiondetail;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PostCollectionDetailRepository extends JpaRepository<PostCollectionDetail, UUID> {
    List<PostCollectionDetail> findByPostCollectionIdOrderByCreatedDateDesc(UUID collectionId);

    List<PostCollectionDetail> findByPostId(UUID postId);
}
