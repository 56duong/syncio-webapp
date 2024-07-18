package online.syncio.backend.messageroom;

import lombok.AllArgsConstructor;
import online.syncio.backend.exception.AppException;
import online.syncio.backend.exception.NotFoundException;
import online.syncio.backend.messagecontent.MessageContentRepository;
import online.syncio.backend.messagecontent.MessageContentService;
import online.syncio.backend.messagecontent.TypeEnum;
import online.syncio.backend.messageroommember.MessageRoomMember;
import online.syncio.backend.messageroommember.MessageRoomMemberRepository;
import online.syncio.backend.messageroommember.MessageRoomMemberService;
import online.syncio.backend.user.User;
import online.syncio.backend.user.UserRepository;
import online.syncio.backend.utils.AuthUtils;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class MessageRoomService {

    private final MessageRoomRepository messageRoomRepository;
    private final MessageRoomMemberRepository messageRoomMemberRepository;
    private final MessageRoomMapper messageRoomMapper;
    private final UserRepository userRepository;
    private final AuthUtils authUtils;
    private final MessageContentService messageContentService;
    private final MessageRoomMemberService messageRoomMemberService;
    private final MessageContentRepository messageContentRepository;


    public List<MessageRoomDTO> findAll() {
        final List<MessageRoom> messageRooms = messageRoomRepository.findAll(Sort.by("createdDate").descending());
        return messageRooms.stream()
                .map(messageRoom -> messageRoomMapper.mapToDTO(messageRoom, new MessageRoomDTO()))
                .toList();
    }


    public List<MessageRoomDTO> findAllRoomsWithContentAndUser(final UUID userId) {
        final User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException(User.class, "id", userId.toString()));
        final List<MessageRoom> messageRooms = messageRoomRepository.findAllRoomsWithContentAndUser(userId);
        return messageRooms.stream()
                .map(messageRoom -> messageRoomMapper.mapToDTO(messageRoom, new MessageRoomDTO()))
                .toList();
    }


    public MessageRoomDTO get(final UUID id) {
        return messageRoomRepository.findById(id)
                .map(messageRoom -> messageRoomMapper.mapToDTO(messageRoom, new MessageRoomDTO()))
                .orElseThrow(() -> new NotFoundException(MessageRoom.class, "id", id.toString()));
    }


    public MessageRoomDTO findExactRoomWithMembers(final Set<UUID> userIds) {
        Optional<MessageRoom> room = messageRoomRepository.findExactRoomWithMembers(userIds, userIds.size());
        return room.map(messageRoom -> messageRoomMapper.mapToDTO(messageRoom, new MessageRoomDTO())).orElse(null);
    }


    @Transactional
    public MessageRoomDTO createMessageRoomWithUsers(final Set<UUID> userIds) {
        // check if the room already exists
        final Optional<MessageRoom> room = messageRoomRepository.findExactRoomWithMembers(userIds, userIds.size());
        // if it exists, return the room
        if (room.isPresent()) {
            return messageRoomMapper.mapToDTO(room.get(), new MessageRoomDTO());
        }
        // if it doesn't exist, create a new room
        final MessageRoom messageRoom = new MessageRoom();
        messageRoom.setGroup(userIds.size() > 2);
        final MessageRoom savedMessageRoom = messageRoomRepository.save(messageRoom);

        // get current user to make as admin
        UUID currentUserId = authUtils.getCurrentLoggedInUserId();
        if(currentUserId == null) {
            throw new AppException(HttpStatus.FORBIDDEN, "You must be logged in to create a room", null);
        }

        // add the users to the room
        userIds.forEach(userId -> {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new NotFoundException(User.class, "id", userId.toString()));
            final MessageRoomMember messageRoomMember = new MessageRoomMember();
            messageRoomMember.setMessageRoom(savedMessageRoom);
            messageRoomMember.setUser(user);
            messageRoomMember.setAdmin(userId.equals(currentUserId));
            messageRoomMember.setLastSeen(LocalDateTime.now());
            messageRoomMemberRepository.save(messageRoomMember);
        });
        // if the room is a group, send a notification that the room has been created
        if(userIds.size() > 2) {
            messageContentService.sendNotification(savedMessageRoom, currentUserId, TypeEnum.NOTIFICATION_CREATE_ROOM, "");
        }

        final MessageRoomDTO messageRoomDTO = new MessageRoomDTO();
        messageRoomMapper.mapToDTO(savedMessageRoom, messageRoomDTO);
        return messageRoomDTO;
    }


    public String convertMessageRoomName(final UUID messageRoomId, final UUID userId) {
        final MessageRoom messageRoom = messageRoomRepository.findById(messageRoomId)
                .orElseThrow(() -> new NotFoundException(MessageRoom.class, "id", messageRoomId.toString()));

        if(messageRoom.getName() != null) {
            return messageRoom.getName();
        }

        List<MessageRoomMember> messageRoomMembers = new ArrayList<>();
        // get all members of the room and set the name
        // if the room is a group, set the name to the list of members
        // else set the name to the other member
        // example: 2 members: John
        // 3 and more members: You, John, Doe, Jane
        messageRoomMembers = messageRoomMemberRepository.findByMessageRoomIdOrderByDateJoined(messageRoomId);
        messageRoomMembers.removeIf(messageRoomMember -> messageRoomMember.getUser().getId().equals(userId));
        String messageRoomName = "";
        if (messageRoomMembers.isEmpty()) {
            messageRoomName = "You";
        }
        else if (messageRoomMembers.size() == 1) {
            messageRoomName = messageRoomMembers.get(0).getUser().getUsername();
        }
        else {
            messageRoomName = "You, "
                    + messageRoomMembers
                    .stream()
                    .map(messageRoomMember -> String.valueOf(messageRoomMember.getUser().getUsername()))
                    .collect(Collectors.joining(", "));
        }

        return messageRoomName;
    }


    public String updateName(final UUID messageRoomId, final String name) {
        final MessageRoom messageRoom = messageRoomRepository.findById(messageRoomId)
                .orElseThrow(() -> new NotFoundException(MessageRoom.class, "id", messageRoomId.toString()));
        // get current user to make as admin
        UUID currentUserId = authUtils.getCurrentLoggedInUserId();
        // check if the current user is an admin of the room
        if(!messageRoomMemberService.isAdmin(messageRoomId, currentUserId)) {
            throw new AppException(HttpStatus.FORBIDDEN, "You must be an admin to change the room name", null);
        }
        messageRoomRepository.updateMessageRoomName(messageRoomId, name);
        return name;
    }

}
