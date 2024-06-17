package online.syncio.backend.messagecontent;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import online.syncio.backend.exception.NotFoundException;
import online.syncio.backend.messageroom.MessageRoom;
import online.syncio.backend.messageroom.MessageRoomRepository;
import online.syncio.backend.user.User;
import online.syncio.backend.user.UserDTO;
import online.syncio.backend.user.UserRepository;
import online.syncio.backend.utils.FIleUtils;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Service
@AllArgsConstructor
public class MessageContentService {
    private final MessageContentRepository messageContentRepository;
    private final MessageRoomRepository messageRoomRepository;
    private final UserRepository userRepository;



//    CRUD
    public List<MessageContentDTO> findAll() {
        final List<MessageContent> messageContents = messageContentRepository.findAll(Sort.by("createdDate"));
        return messageContents.stream()
                .map(messageContent -> mapToDTO(messageContent, new MessageContentDTO()))
                .toList();
    }

    public MessageContentDTO get(final UUID id) {
        return messageContentRepository.findById(id)
                .map(messageContent -> mapToDTO(messageContent, new MessageContentDTO()))
                .orElseThrow(() -> new NotFoundException(MessageContent.class, "id", id.toString()));
    }

    public List<MessageContentDTO> findByMessageRoomId(final UUID messageRoomId) {
        return messageContentRepository.findByMessageRoomIdOrderByDateSentAsc(messageRoomId)
                .stream()
                .map(messageContent -> mapToDTO(messageContent, new MessageContentDTO()))
                .toList();
    }

    public UUID create(final MessageContentDTO messageContentDTO) {
        final MessageContent messageContent = new MessageContent();
        mapToEntity(messageContentDTO, messageContent);
        return messageContentRepository.save(messageContent).getId();
    }

    public void update(final UUID id, final MessageContentDTO messageContentDTO) {
        final MessageContent messageContent = messageContentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(MessageContent.class, "id", id.toString()));
        mapToEntity(messageContentDTO, messageContent);
        messageContentRepository.save(messageContent);
    }

    public void delete(final UUID id) {
        final MessageContent messageContent = messageContentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(MessageContent.class, "id", id.toString()));
        messageContentRepository.delete(messageContent);
    }

    @Transactional
    public List<String> uploadPhotos(final List<MultipartFile> photos) {
        return photos.stream()
                .map(photo -> {
                    try {
                        return FIleUtils.storeFile(photo);
                    } catch (IOException e) {
                        throw new RuntimeException("Could not save photo: " + photo.getOriginalFilename());
                    }
                })
                .toList();
    }



//    MAPPER
    private MessageContentDTO mapToDTO(final MessageContent messageContent, final MessageContentDTO messageContentDTO) {
        messageContentDTO.setId(messageContent.getId());
        messageContentDTO.setMessageRoomId(messageContent.getMessageRoom().getId());

        UserDTO userDTO = new UserDTO();
        userDTO.setId(messageContent.getUser().getId());
        userDTO.setUsername(messageContent.getUser().getUsername());
        userDTO.setAvtURL(messageContent.getUser().getAvtURL());
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
            replyToUserDTO.setAvtURL(messageContent.getParentMessageContent().getUser().getAvtURL());
            replyTo.setUser(replyToUserDTO);
            messageContentDTO.setReplyTo(replyTo);
        }

        return messageContentDTO;
    }

    private MessageContent mapToEntity(final MessageContentDTO messageContentDTO, final MessageContent messageContent) {
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
