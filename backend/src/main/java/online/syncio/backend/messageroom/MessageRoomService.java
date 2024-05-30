package online.syncio.backend.messageroom;

import online.syncio.backend.exception.NotFoundException;
import online.syncio.backend.exception.ReferencedWarning;
import online.syncio.backend.messagecontent.MessageContent;
import online.syncio.backend.messagecontent.MessageContentRepository;
import online.syncio.backend.messageroommember.MessageRoomMember;
import online.syncio.backend.messageroommember.MessageRoomMemberRepository;
import online.syncio.backend.user.User;
import online.syncio.backend.user.UserRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class MessageRoomService {
    private final MessageRoomRepository messageRoomRepository;
    private final MessageRoomMemberRepository messageRoomMemberRepository;
    private final MessageContentRepository messageContentRepository;
    private final UserRepository userRepository;

    public MessageRoomService(MessageRoomRepository messageRoomRepository, MessageRoomMemberRepository messageRoomMemberRepository, MessageContentRepository messageContentRepository, UserRepository userRepository) {
        this.messageRoomRepository = messageRoomRepository;
        this.messageRoomMemberRepository = messageRoomMemberRepository;
        this.messageContentRepository = messageContentRepository;
        this.userRepository = userRepository;
    }

    

//    CRUD
    public List<MessageRoomDTO> findAll() {
        final List<MessageRoom> messageRooms = messageRoomRepository.findAll(Sort.by("createdDate").descending());
        return messageRooms.stream()
                .map(messageRoom -> mapToDTO(messageRoom, new MessageRoomDTO()))
                .toList();
    }

    public List<MessageRoomDTO> findAllRoomsWithContentAndUser(final UUID userId) {
        final List<MessageRoom> messageRooms = messageRoomRepository.findAllRoomsWithContentAndUser(userId);
        return messageRooms.stream()
                .map(messageRoom -> mapToDTO(messageRoom, new MessageRoomDTO()))
                .toList();
    }

    public MessageRoomDTO get(final UUID id) {
        return messageRoomRepository.findById(id)
                .map(messageRoom -> mapToDTO(messageRoom, new MessageRoomDTO()))
                .orElseThrow(() -> new NotFoundException(MessageRoom.class, "id", id.toString()));
    }

    public List<MessageRoomDTO> findByMessageRoomMembersUserId(final UUID userId) {
        final List<MessageRoom> messageRooms = messageRoomRepository.findByMessageRoomMembersUserId(userId);
        return messageRooms.stream()
                .map(messageRoom -> mapToDTO(messageRoom, new MessageRoomDTO()))
                .toList();
    }

    public MessageRoomDTO findExactRoomWithMembers(final List<UUID> userIds) {
        Optional<MessageRoom> room = messageRoomRepository.findExactRoomWithMembers(userIds, userIds.size());
        return room.map(messageRoom -> mapToDTO(messageRoom, new MessageRoomDTO())).orElse(null);
    }

    public UUID create(final MessageRoomDTO messageRoomDTO) {
        final MessageRoom messageRoom = new MessageRoom();
        mapToEntity(messageRoomDTO, messageRoom);
        return messageRoomRepository.save(messageRoom).getId();
    }

    @Transactional
    public MessageRoomDTO createMessageRoomWithUsers(final List<UUID> userIds) {
        // check if the room already exists
        final Optional<MessageRoom> room = messageRoomRepository.findExactRoomWithMembers(userIds, userIds.size());
        // if it exists, return the room
        if (room.isPresent()) {
            return mapToDTO(room.get(), new MessageRoomDTO());
        }
        // if it doesn't exist, create a new room
        final MessageRoom messageRoom = new MessageRoom();
        final MessageRoom savedMessageRoom = messageRoomRepository.save(messageRoom);
        // add the users to the room
        userIds.forEach(userId -> {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new NotFoundException(User.class, "id", userId.toString()));
            final MessageRoomMember messageRoomMember = new MessageRoomMember();
            messageRoomMember.setMessageRoom(savedMessageRoom);
            messageRoomMember.setUser(user);
            messageRoomMemberRepository.save(messageRoomMember);
        });
        final MessageRoomDTO messageRoomDTO = new MessageRoomDTO();
        mapToDTO(savedMessageRoom, messageRoomDTO);
        return messageRoomDTO;
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

        List<MessageRoomMember> messageRoomMembers = messageRoomMemberRepository.findByMessageRoomId(messageRoom.getId());
        messageRoomDTO.setName(
                messageRoomMembers
                    .stream()
                    .map(messageRoomMember -> String.valueOf(messageRoomMember.getUser().getUsername()))
                    .collect(Collectors.joining(", ")));
        messageRoomDTO.setGroup(messageRoomMembers.size() > 2);
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
