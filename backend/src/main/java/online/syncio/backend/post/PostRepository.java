package online.syncio.backend.post;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PostRepository extends JpaRepository<Post, UUID> {

    /* Find posts which were created by a user with the UUID in createdBy column */
    List<Post> findByCreatedBy_IdOrderByCreatedDateDesc (UUID id);
}
