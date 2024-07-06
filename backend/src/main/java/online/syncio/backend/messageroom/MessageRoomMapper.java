package online.syncio.backend.messageroom;

import lombok.AllArgsConstructor;
import online.syncio.backend.messageroommember.MessageRoomMember;
import online.syncio.backend.messageroommember.MessageRoomMemberRepository;
import online.syncio.backend.utils.AuthUtils;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@AllArgsConstructor
public class MessageRoomMapper {

    public final MessageRoomMemberRepository messageRoomMemberRepository;
    public final AuthUtils authUtils;


    public MessageRoomDTO mapToDTO(final MessageRoom messageRoom, final MessageRoomDTO messageRoomDTO) {
        messageRoomDTO.setId(messageRoom.getId());

        List<MessageRoomMember> messageRoomMembers = new ArrayList<>();
        if(messageRoom.getName() != null) {
            messageRoomDTO.setName(messageRoom.getName());
        }
        else {
            // get all members of the room and set the name
            // if the room is a group, set the name to the list of members
            // else set the name to the other member
            // example: 2 members: John
            // 3 and more members: You, John, Doe, Jane
            messageRoomMembers = messageRoomMemberRepository.findByMessageRoomIdOrderByDateJoined(messageRoom.getId());
            UUID currentUserId = authUtils.getCurrentLoggedInUserId();
            messageRoomMembers.removeIf(messageRoomMember -> messageRoomMember.getUser().getId().equals(currentUserId));
            String messageRoomName = "";
            if(messageRoomMembers.isEmpty()) {
                messageRoomName = "You";
            }
            else if(messageRoomMembers.size() == 1) {
                messageRoomName = messageRoomMembers.get(0).getUser().getUsername();
            }
            else {
                messageRoomName = "You, "
                    + messageRoomMembers
                        .stream()
                        .map(messageRoomMember -> String.valueOf(messageRoomMember.getUser().getUsername()))
                        .collect(Collectors.joining(", "));
            }

            messageRoomDTO.setName(messageRoomName);
        }

        messageRoomDTO.setCreatedDate(messageRoom.getCreatedDate());
        messageRoomDTO.setGroup(messageRoom.isGroup());
        messageRoomDTO.setCreatedBy(messageRoom.getCreatedBy().getId());
        return messageRoomDTO;
    }


    private MessageRoom mapToEntity(final MessageRoomDTO messageRoomDTO, final MessageRoom messageRoom) {
        messageRoom.setCreatedDate(messageRoomDTO.getCreatedDate());
        return messageRoom;
    }

}
