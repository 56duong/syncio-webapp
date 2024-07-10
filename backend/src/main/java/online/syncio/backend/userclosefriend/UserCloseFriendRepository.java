package online.syncio.backend.userclosefriend;

import online.syncio.backend.idclass.PkUserUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface UserCloseFriendRepository extends JpaRepository<UserCloseFriend, PkUserUser> {

    boolean existsByTargetIdAndActorId(UUID targetId, UUID actorId);

    void deleteByTargetIdAndActorId(UUID targetId, UUID actorId);

}
