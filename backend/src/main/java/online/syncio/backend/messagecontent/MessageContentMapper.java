package online.syncio.backend.messagecontent;

import lombok.AllArgsConstructor;
import online.syncio.backend.exception.NotFoundException;
import online.syncio.backend.messageroom.MessageRoom;
import online.syncio.backend.messageroom.MessageRoomRepository;
import online.syncio.backend.user.User;
import online.syncio.backend.user.UserDTO;
import online.syncio.backend.user.UserRepository;
import org.springframework.stereotype.Component;

@Component
@AllArgsConstructor
public class MessageContentMapper {

    private final MessageRoomRepository messageRoomRepository;
    private final UserRepository userRepository;
    private final MessageContentRepository messageContentRepository;


    public MessageContentDTO mapToDTO(final MessageContent messageContent, final MessageContentDTO messageContentDTO) {
        messageContentDTO.setId(messageContent.getId());
        messageContentDTO.setMessageRoomId(messageContent.getMessageRoom().getId());

        UserDTO userDTO = new UserDTO();
        userDTO.setId(messageContent.getUser().getId());
        userDTO.setUsername(messageContent.getUser().getUsername());
        messageContentDTO.setUser(userDTO);

        messageContentDTO.setMessage(messageContent.getMessage());
        messageContentDTO.setDateSent(messageContent.getDateSent());
        messageContentDTO.setType(messageContent.getType());

        // If the message is a reply to another message, set the replyTo field (parent message content is the message being replied to)
        if(messageContent.getParentMessageContent() != null) {
            MessageContentDTO replyTo = new MessageContentDTO();
            replyTo.setId(messageContent.getParentMessageContent().getId());
            replyTo.setMessage(messageContent.getParentMessageContent().getMessage());
            replyTo.setDateSent(messageContent.getParentMessageContent().getDateSent());
            replyTo.setType(messageContent.getParentMessageContent().getType());
            UserDTO replyToUserDTO = new UserDTO();
            replyToUserDTO.setId(messageContent.getParentMessageContent().getUser().getId());
            replyToUserDTO.setUsername(messageContent.getParentMessageContent().getUser().getUsername());
            replyTo.setUser(replyToUserDTO);
            messageContentDTO.setReplyTo(replyTo);
        }

        return messageContentDTO;
    }


    public MessageContent mapToEntity(final MessageContentDTO messageContentDTO, final MessageContent messageContent) {
        final MessageRoom messageRoom = messageContentDTO.getMessageRoomId() == null ? null : messageRoomRepository.findById(messageContentDTO.getMessageRoomId())
                .orElseThrow(() -> new NotFoundException(MessageRoom.class, "id", messageContentDTO.getMessageRoomId().toString()));
        messageContent.setMessageRoom(messageRoom);

        final User user = messageContentDTO.getUser().getId() == null ? null : userRepository.findById(messageContentDTO.getUser().getId())
                .orElseThrow(() -> new NotFoundException(User.class, "id", messageContentDTO.getUser().getId().toString()));
        messageContent.setUser(user);

        messageContent.setMessage(messageContentDTO.getMessage());
        messageContent.setDateSent(messageContentDTO.getDateSent());
        messageContent.setType(messageContentDTO.getType());

        final MessageContent parentMessageContent = messageContentDTO.getReplyTo() == null ? null : messageContentRepository.findById(messageContentDTO.getReplyTo().getId())
                .orElseThrow(() -> new NotFoundException(MessageContent.class, "id", messageContentDTO.getReplyTo().getId().toString()));
        messageContent.setParentMessageContent(parentMessageContent);

        return messageContent;
    }

}
