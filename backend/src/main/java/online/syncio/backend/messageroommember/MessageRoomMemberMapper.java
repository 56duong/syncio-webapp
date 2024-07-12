package online.syncio.backend.messageroommember;

import lombok.AllArgsConstructor;
import online.syncio.backend.exception.NotFoundException;
import online.syncio.backend.messageroom.MessageRoom;
import online.syncio.backend.messageroom.MessageRoomRepository;
import online.syncio.backend.user.User;
import online.syncio.backend.user.UserRepository;
import org.springframework.stereotype.Component;

@Component
@AllArgsConstructor
public class MessageRoomMemberMapper {

    private final MessageRoomRepository messageRoomRepository;
    private final UserRepository userRepository;


    public MessageRoomMemberDTO mapToDTO(final MessageRoomMember messageRoomMember, final MessageRoomMemberDTO messageRoomMemberDTO) {
        messageRoomMemberDTO.setMessageRoomId(messageRoomMember.getMessageRoom().getId());
        messageRoomMemberDTO.setUserId(messageRoomMember.getUser().getId());
        messageRoomMemberDTO.setUsername(messageRoomMember.getUser().getUsername());
        messageRoomMemberDTO.setDateJoined(messageRoomMember.getDateJoined());
        messageRoomMemberDTO.setAdmin(messageRoomMember.isAdmin());
        return messageRoomMemberDTO;
    }


    public MessageRoomMember mapToEntity(final MessageRoomMemberDTO messageRoomMemberDTO, final MessageRoomMember messageRoomMember) {
        final MessageRoom messageRoom = messageRoomMemberDTO.getMessageRoomId() == null ? null : messageRoomRepository.findById(messageRoomMemberDTO.getMessageRoomId())
                .orElseThrow(() -> new NotFoundException(MessageRoom.class, "id", messageRoomMemberDTO.getMessageRoomId().toString()));
        messageRoomMember.setMessageRoom(messageRoom);
        final User user = messageRoomMemberDTO.getUserId() == null ? null : userRepository.findById(messageRoomMemberDTO.getUserId())
                .orElseThrow(() -> new NotFoundException(User.class, "id", messageRoomMemberDTO.getUserId().toString()));
        messageRoomMember.setUser(user);
        messageRoomMember.setDateJoined(messageRoomMemberDTO.getDateJoined());
        messageRoomMember.setAdmin(messageRoomMemberDTO.isAdmin());
        return messageRoomMember;
    }

}
