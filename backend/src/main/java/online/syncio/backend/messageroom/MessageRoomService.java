package online.syncio.backend.messageroom;

import online.syncio.backend.exception.NotFoundException;
import online.syncio.backend.exception.ReferencedWarning;
import online.syncio.backend.messagecontent.MessageContent;
import online.syncio.backend.messagecontent.MessageContentRepository;
import online.syncio.backend.messageroommember.MessageRoomMember;
import online.syncio.backend.messageroommember.MessageRoomMemberRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class MessageRoomService {
    private final MessageRoomRepository messageRoomRepository;
    private final MessageRoomMemberRepository messageRoomMemberRepository;
    private final MessageContentRepository messageContentRepository;

    public MessageRoomService(MessageRoomRepository messageRoomRepository, MessageRoomMemberRepository messageRoomMemberRepository, MessageContentRepository messageContentRepository) {
        this.messageRoomRepository = messageRoomRepository;
        this.messageRoomMemberRepository = messageRoomMemberRepository;
        this.messageContentRepository = messageContentRepository;
    }

    

//    CRUD
    public List<MessageRoomDTO> findAll() {
        final List<MessageRoom> messageRooms = messageRoomRepository.findAll(Sort.by("createdDate").descending());
        return messageRooms.stream()
                .map(messageRoom -> mapToDTO(messageRoom, new MessageRoomDTO()))
                .toList();
    }

    public MessageRoomDTO get(final UUID id) {
        return messageRoomRepository.findById(id)
                .map(messageRoom -> mapToDTO(messageRoom, new MessageRoomDTO()))
                .orElseThrow(() -> new NotFoundException(MessageRoom.class, "id", id.toString()));
    }

    public UUID create(final MessageRoomDTO messageRoomDTO) {
        final MessageRoom messageRoom = new MessageRoom();
        mapToEntity(messageRoomDTO, messageRoom);
        return messageRoomRepository.save(messageRoom).getId();
    }

    public void update(final UUID id, final MessageRoomDTO messageRoomDTO) {
        final MessageRoom messageRoom = messageRoomRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(MessageRoom.class, "id", id.toString()));
        mapToEntity(messageRoomDTO, messageRoom);
        messageRoomRepository.save(messageRoom);
    }

    public void delete(final UUID id) {
        final MessageRoom messageRoom = messageRoomRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(MessageRoom.class, "id", id.toString()));
        messageRoomRepository.delete(messageRoom);
    }


//    MAPPER
    private MessageRoomDTO mapToDTO(final MessageRoom messageRoom, final MessageRoomDTO messageRoomDTO) {
        messageRoomDTO.setId(messageRoom.getId());
        messageRoomDTO.setCreatedDate(messageRoom.getCreatedDate());
        return messageRoomDTO;
    }

    private MessageRoom mapToEntity(final MessageRoomDTO messageRoomDTO, final MessageRoom messageRoom) {
        messageRoom.setCreatedDate(messageRoomDTO.getCreatedDate());
        return messageRoom;
    }



//    REFERENCED
    public ReferencedWarning getReferencedWarning(final UUID id) {
        final ReferencedWarning referencedWarning = new ReferencedWarning();
        final MessageRoom messageRoom = messageRoomRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(MessageRoom.class, "id", id.toString()));

        // MessageRoomMember
        final MessageRoomMember userMessageRoomMember = messageRoomMemberRepository.findFirstByMessageRoom(messageRoom);
        if (userMessageRoomMember != null) {
            referencedWarning.setKey("messageRoom.messageRoomMember.messageRoom.referenced");
            referencedWarning.addParam(userMessageRoomMember.getMessageRoom().getId());
            return referencedWarning;
        }

        // MessageContent
        final MessageContent userMessageContent = messageContentRepository.findFirstByMessageRoom(messageRoom);
        if (userMessageContent != null) {
            referencedWarning.setKey("messageRoom.messageContent.messageRoom.referenced");
            referencedWarning.addParam(userMessageContent.getMessageRoom().getId());
            return referencedWarning;
        }

        return null;
    }
}
