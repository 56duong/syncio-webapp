package online.syncio.backend.post;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PostRepository extends JpaRepository<Post, UUID> {

    /* Find posts which were created by a user with the UUID in createdBy column */
    List<Post> findByCreatedBy_IdOrderByCreatedDateDesc (UUID id);

    /**
     * This method is used to get the caption of a post by its id.
     * @param id the post id
     * @return the caption of the post
     */
    @Query(value = "SELECT caption FROM post WHERE id = :id", nativeQuery = true)
    String getCaptionById(UUID id);

    /**
     * This method is used to get the first photo of a post by its id.
     * @param postId the post id
     * @return the first photo of the post
     */
    @Query(value = "SELECT photos FROM post_photos WHERE post_id = :postId LIMIT 1", nativeQuery = true)
    String findFirstPhotoIdByPostId(UUID postId);

}
