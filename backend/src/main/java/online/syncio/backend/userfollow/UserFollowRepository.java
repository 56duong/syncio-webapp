package online.syncio.backend.userfollow;

import online.syncio.backend.idclass.PkUserUser;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UserFollowRepository extends JpaRepository<UserFollow, PkUserUser> {

    boolean existsByTargetIdAndActorId(UUID targetId, UUID actorId);

    void deleteByTargetIdAndActorId(UUID targetId, UUID actorId);

    List<UserFollow> findAllByActorId(UUID actorId);

    List<UserFollow> findAllByTargetId(UUID targetId);

    /**
     * Retrieves a page of UserFollow entities based on the target user (the one being followed).
     * If the actor user is followed by the current user, they are given higher priority (sorted first).
     *
     * @param targetId The ID of the target user (the one being followed).
     * @param currentUserId The ID of the current logged-in user.
     * @param pageable The pagination and sorting information.
     * @return A page of UserFollow entities sorted by mutual follow status.
     */
    @Query("SELECT uf FROM UserFollow uf WHERE uf.target.id = :targetId ORDER BY CASE WHEN uf.actor.id IN (SELECT ufr.target.id FROM UserFollow ufr WHERE ufr.actor.id = :currentUserId) THEN 1 ELSE 2 END")
    Page<UserFollow> findFollowersSortedByMutualFollow(@Param("targetId") UUID targetId, @Param("currentUserId") UUID currentUserId, Pageable pageable);

    /**
     * Retrieves a page of UserFollow entities based on the actor user (the one following).
     * If the target user is following the current user, they are given higher priority (sorted first).
     * @param actorId
     * @param currentUserId
     * @param pageable
     * @return
     */
    @Query("SELECT uf FROM UserFollow uf WHERE uf.actor.id = :actorId ORDER BY CASE WHEN uf.target.id IN (SELECT ufr.actor.id FROM UserFollow ufr WHERE ufr.target.id = :currentUserId) THEN 1 ELSE 2 END")
    Page<UserFollow> findFollowingsSortedByMutualFollow(@Param("actorId") UUID actorId, @Param("currentUserId") UUID currentUserId, Pageable pageable);

}
