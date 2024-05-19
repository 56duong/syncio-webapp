package online.syncio.backend.messagecontent;

import online.syncio.backend.exception.NotFoundException;
import online.syncio.backend.messageroom.MessageRoom;
import online.syncio.backend.messageroom.MessageRoomRepository;
import online.syncio.backend.user.User;
import online.syncio.backend.user.UserRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class MessageContentService {
    private final MessageContentRepository messageContentRepository;
    private final MessageRoomRepository messageRoomRepository;
    private final UserRepository userRepository;

    public MessageContentService(MessageContentRepository messageContentRepository, MessageRoomRepository messageRoomRepository, UserRepository userRepository) {
        this.messageContentRepository = messageContentRepository;
        this.messageRoomRepository = messageRoomRepository;
        this.userRepository = userRepository;
    }



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
        return messageContentRepository.findByMessageRoomId(messageRoomId)
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



//    MAPPER
    private MessageContentDTO mapToDTO(final MessageContent messageContent, final MessageContentDTO messageContentDTO) {
        messageContentDTO.setId(messageContent.getId());
        messageContentDTO.setMessageRoomId(messageContent.getMessageRoom().getId());
        messageContentDTO.setUserId(messageContent.getUser().getId());
        messageContentDTO.setMessage(messageContent.getMessage());
        messageContentDTO.setDateSent(messageContent.getDateSent());
        return messageContentDTO;
    }

    private MessageContent mapToEntity(final MessageContentDTO messageContentDTO, final MessageContent messageContent) {
        final MessageRoom messageRoom = messageContentDTO.getMessageRoomId() == null ? null : messageRoomRepository.findById(messageContentDTO.getMessageRoomId())
                .orElseThrow(() -> new NotFoundException(MessageRoom.class, "id", messageContentDTO.getMessageRoomId().toString()));
        messageContent.setMessageRoom(messageRoom);
        final User user = messageContentDTO.getMessageRoomId() == null ? null : userRepository.findById(messageContentDTO.getUserId())
                .orElseThrow(() -> new NotFoundException(User.class, "id", messageContentDTO.getUserId().toString()));
        messageContent.setUser(user);
        messageContent.setMessage(messageContentDTO.getMessage());
        messageContent.setDateSent(messageContentDTO.getDateSent());
        return messageContent;
    }
}
