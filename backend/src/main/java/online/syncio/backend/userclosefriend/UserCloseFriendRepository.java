package online.syncio.backend.userclosefriend;

import online.syncio.backend.idclass.PkUserUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UserCloseFriendRepository extends JpaRepository<UserCloseFriend, PkUserUser> {

    boolean existsByTargetIdAndActorId(UUID targetId, UUID actorId);

    void deleteByTargetIdAndActorId(UUID targetId, UUID actorId);

    @Query("SELECT new online.syncio.backend.userclosefriend.UserFollowingCloseFriendDTO(uf.target.id, uf.target.username, CASE WHEN ucf.actor.id IS NULL THEN false ELSE true END) " +
            "FROM UserFollow uf " +
            "LEFT JOIN UserCloseFriend ucf ON ucf.target.id = uf.target.id AND ucf.actor.id = :userId " +
            "WHERE uf.actor.id = :userId")
    List<UserFollowingCloseFriendDTO> getFollowingCloseFriends(UUID userId);

}
