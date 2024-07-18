package online.syncio.backend.messageroom;

import lombok.AllArgsConstructor;
import online.syncio.backend.exception.NotFoundException;
import online.syncio.backend.messagecontent.MessageContentDTO;
import online.syncio.backend.messagecontent.MessageContentMapper;
import online.syncio.backend.messagecontent.MessageContentRepository;
import online.syncio.backend.messageroommember.MessageRoomMember;
import online.syncio.backend.messageroommember.MessageRoomMemberRepository;
import online.syncio.backend.user.User;
import online.syncio.backend.user.UserRepository;
import online.syncio.backend.utils.AuthUtils;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@AllArgsConstructor
public class MessageRoomMapper {

    private final MessageRoomMemberRepository messageRoomMemberRepository;
    private final AuthUtils authUtils;
    private final UserRepository userRepository;
    private final MessageContentRepository messageContentRepository;
    private final MessageContentMapper messageContentMapper;


    public MessageRoomDTO mapToDTO(final MessageRoom messageRoom, final MessageRoomDTO messageRoomDTO) {
        messageRoomDTO.setId(messageRoom.getId());

        List<MessageRoomMember> messageRoomMembers = messageRoomMemberRepository.findByMessageRoomIdOrderByDateJoined(messageRoom.getId());
        UUID currentUserId = authUtils.getCurrentLoggedInUserId();
        messageRoomMembers.removeIf(messageRoomMember -> messageRoomMember.getUser().getId().equals(currentUserId));

        // if room is not a group, set the avatar to the other member
        messageRoomDTO.setAvatarURL(messageRoomMembers.size() == 1 ? messageRoomMembers.get(0).getUser().getId().toString() : null);

        // set name of the room
        if(messageRoom.getName() != null) {
            messageRoomDTO.setName(messageRoom.getName());
        }
        else {
            // get all members of the room and set the name
            // if the room is a group, set the name to the list of members
            // else set the name to the other member
            // example: 2 members: John
            // 3 and more members: You, John, Doe, Jane
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
        // set last seen, unseen count, last message
        final MessageRoomMember messageRoomMember = messageRoomMemberRepository.findByMessageRoomIdAndUserId(messageRoom.getId(), currentUserId)
                .orElseThrow(() -> new NotFoundException(MessageRoomMember.class, "messageRoomId", messageRoom.getId().toString(), "userId", currentUserId.toString()));
        messageRoomDTO.setLastSeen(messageRoomMember.getLastSeen());
        messageRoomDTO.setUnSeenCount(messageContentRepository.countByMessageRoomIdAndDateSentAfterAndUserIdNot(messageRoomMember.getMessageRoom().getId(), messageRoomMember.getLastSeen(), currentUserId));
        messageRoomDTO.setLastMessage(messageContentRepository.findFirstByMessageRoomIdOrderByDateSentDesc(messageRoom.getId())
                .map(messageContent -> messageContentMapper.mapToDTO(messageContent, new MessageContentDTO()))
                .orElse(null));
        return messageRoomDTO;
    }


    public MessageRoom mapToEntity(final MessageRoomDTO messageRoomDTO, final MessageRoom messageRoom) {
        messageRoom.setName(messageRoomDTO.getName());
        messageRoom.setGroup(messageRoomDTO.isGroup());
        final User user = messageRoomDTO.getCreatedBy() == null ? null : userRepository.findById(messageRoomDTO.getCreatedBy())
                .orElseThrow(() -> new NotFoundException(User.class, "id", messageRoomDTO.getCreatedBy().toString()));
        messageRoom.setCreatedBy(user);
        messageRoom.setCreatedDate(messageRoomDTO.getCreatedDate());
        return messageRoom;
    }

}
