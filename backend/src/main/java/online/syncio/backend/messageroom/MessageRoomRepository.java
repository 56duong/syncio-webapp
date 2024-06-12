package online.syncio.backend.messageroom;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MessageRoomRepository extends JpaRepository<MessageRoom, UUID> {
    List<MessageRoom> findByMessageRoomMembersUserId(UUID userId);

    /**
     * Find exact room with members
     * @param userIds List of user ids
     * @param size Size of the list to compare
     * @return Optional of MessageRoom
     */
    @Query(value = "" +
            "SELECT mr " +
            "FROM MessageRoom mr " +
            "WHERE mr.id IN " +
            "(SELECT mrm.messageRoom.id FROM MessageRoomMember mrm " +
            "WHERE mrm.user.id IN :userIds " +
            "GROUP BY mrm.messageRoom.id " +
            "HAVING COUNT(mrm.messageRoom.id) = :size) " +
            "AND SIZE(mr.messageRoomMembers) = :size")
    Optional<MessageRoom> findExactRoomWithMembers(@Param("userIds") List<UUID> userIds, @Param("size") long size);

    /**
     * Find all rooms of user with at least one content
     * @param userId User id to search
     * @return List of MessageRoom
     */
    @Query("SELECT mr FROM MessageRoom mr JOIN mr.messageRoomMembers mrm JOIN mr.messageContents mc WHERE mrm.user.id = :userId GROUP BY mr HAVING COUNT(mc) > 0")
    List<MessageRoom> findAllRoomsWithContentAndUser(@Param("userId") UUID userId);

}
