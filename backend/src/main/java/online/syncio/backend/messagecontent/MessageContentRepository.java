package online.syncio.backend.messagecontent;

import online.syncio.backend.messageroom.MessageRoom;
import online.syncio.backend.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MessageContentRepository extends JpaRepository<MessageContent, UUID> {

    MessageContent findFirstByMessageRoom(MessageRoom messageRoom);

    MessageContent findFirstByUser(User user);

    List<MessageContent> findByMessageRoomIdOrderByDateSentAsc(UUID messageRoomId);

}
