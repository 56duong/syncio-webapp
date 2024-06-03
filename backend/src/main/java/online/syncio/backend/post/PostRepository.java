package online.syncio.backend.post;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PostRepository extends JpaRepository<Post, UUID> {
<<<<<<< HEAD
    List<Post> findAllByFlagTrueOrderByCreatedDateDesc();
=======

    long countByCreatedBy_Id (UUID id);
>>>>>>> 24ed730fc84260aeb60a474282a3d62222fd8f63
}
