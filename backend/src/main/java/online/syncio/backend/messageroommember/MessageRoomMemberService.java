package online.syncio.backend.messageroommember;

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
public class MessageRoomMemberService {
    private final MessageRoomMemberRepository messageRoomMemberRepository;
    private final MessageRoomRepository messageRoomRepository;
    private final UserRepository userRepository;

    public MessageRoomMemberService(MessageRoomMemberRepository messageRoomMemberRepository, MessageRoomRepository messageRoomRepository, UserRepository userRepository) {
        this.messageRoomMemberRepository = messageRoomMemberRepository;
        this.messageRoomRepository = messageRoomRepository;
        this.userRepository = userRepository;
    }



    //    CRUD
    public List<MessageRoomMemberDTO> findAll() {
        final List<MessageRoomMember> messageRoomMembers = messageRoomMemberRepository.findAll(Sort.by("dateJoined").descending());
        return messageRoomMembers.stream()
                .map(messageRoomMember -> mapToDTO(messageRoomMember, new MessageRoomMemberDTO()))
                .toList();
    }
    
    public List<MessageRoomMemberDTO> findByMessageRoomId(final UUID messageRoomId) {
        return messageRoomMemberRepository.findByMessageRoomId(messageRoomId)
                .stream()
                .map(messageContent -> mapToDTO(messageContent, new MessageRoomMemberDTO()))
                .toList();
    }

    public void create(final MessageRoomMemberDTO messageRoomMemberDTO) {
        final MessageRoomMember messageRoomMember = new MessageRoomMember();
        mapToEntity(messageRoomMemberDTO, messageRoomMember);
        messageRoomMemberRepository.save(messageRoomMember);
    }

    public void update(final UUID postId, final UUID userId, final MessageRoomMemberDTO messageRoomMemberDTO) {
        final MessageRoomMember messageRoomMember = messageRoomMemberRepository.findByMessageRoomIdAndUserId(postId, userId)
                .orElseThrow(() -> new NotFoundException(MessageRoomMember.class, "messageRoomId", postId.toString(), "userId", userId.toString()));
        mapToEntity(messageRoomMemberDTO, messageRoomMember);
        messageRoomMemberRepository.save(messageRoomMember);
    }

    public void delete(final UUID messageRoomId, final UUID userId) {
        final MessageRoomMember messageRoomMember = messageRoomMemberRepository.findByMessageRoomIdAndUserId(messageRoomId, userId)
                .orElseThrow(() -> new NotFoundException(MessageRoomMember.class, "messageRoomId", messageRoomId.toString(), "userId", userId.toString()));
        messageRoomMemberRepository.delete(messageRoomMember);
    }



//    MAPPER
    private MessageRoomMemberDTO mapToDTO(final MessageRoomMember messageRoomMember, final MessageRoomMemberDTO messageRoomMemberDTO) {
        messageRoomMemberDTO.setMessageRoomId(messageRoomMember.getMessageRoom().getId());
        messageRoomMemberDTO.setUserId(messageRoomMember.getUser().getId());
        messageRoomMemberDTO.setDateJoined(messageRoomMember.getDateJoined());
        return messageRoomMemberDTO;
    }

    private MessageRoomMember mapToEntity(final MessageRoomMemberDTO messageRoomMemberDTO, final MessageRoomMember messageRoomMember) {
        final MessageRoom post = messageRoomMemberDTO.getMessageRoomId() == null ? null : messageRoomRepository.findById(messageRoomMemberDTO.getMessageRoomId())
                .orElseThrow(() -> new NotFoundException(MessageRoom.class, "id", messageRoomMemberDTO.getMessageRoomId().toString()));
        messageRoomMember.setMessageRoom(post);
        final User user = messageRoomMemberDTO.getUserId() == null ? null : userRepository.findById(messageRoomMemberDTO.getUserId())
                .orElseThrow(() -> new NotFoundException(User.class, "id", messageRoomMemberDTO.getUserId().toString()));
        messageRoomMember.setUser(user);
        messageRoomMember.setDateJoined(messageRoomMemberDTO.getDateJoined());
        return messageRoomMember;
    }
}
