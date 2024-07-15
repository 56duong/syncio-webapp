package online.syncio.backend.messageroommember;

import online.syncio.backend.idclass.PkUserMessageRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MessageRoomMemberRepository extends JpaRepository<MessageRoomMember, PkUserMessageRoom> {

    Optional<MessageRoomMember> findByMessageRoomIdAndUserId(UUID messageRoomId, UUID userId);

    List<MessageRoomMember> findByMessageRoomIdOrderByDateJoined(UUID messageRoomId);

    boolean existsByMessageRoomIdAndUserIdAndIsAdmin(UUID messageRoomId, UUID userId, boolean isAdmin);

    Long countByMessageRoomIdAndIsAdminAndUserIdNot(UUID messageRoomId, boolean isAdmin, UUID userId);

}
