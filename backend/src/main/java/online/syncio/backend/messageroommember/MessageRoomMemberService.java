package online.syncio.backend.messageroommember;

import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import online.syncio.backend.exception.AppException;
import online.syncio.backend.exception.NotFoundException;
import online.syncio.backend.userfollow.UserFollowRepository;
import online.syncio.backend.usersetting.UserSettingRepository;
import online.syncio.backend.usersetting.WhoCanAddYouToGroupChat;
import online.syncio.backend.utils.AuthUtils;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@AllArgsConstructor
public class MessageRoomMemberService {

    private final MessageRoomMemberRepository messageRoomMemberRepository;
    private final MessageRoomMemberMapper messageRoomMemberMapper;
    private final AuthUtils authUtils;
    private final UserSettingRepository userSettingRepository;
    private final UserFollowRepository userFollowRepository;

    
    public List<MessageRoomMemberDTO> findByMessageRoomId(final UUID messageRoomId) {
        final UUID currentUserId = authUtils.getCurrentLoggedInUserId();
        final MessageRoomMember currentMessageRoomMember = messageRoomMemberRepository.findByMessageRoomIdAndUserId(messageRoomId, currentUserId)
                .orElseThrow(() -> new NotFoundException(MessageRoomMember.class, "messageRoomId", messageRoomId.toString(), "userId", currentUserId.toString()));
        return messageRoomMemberRepository.findByMessageRoomIdOrderByDateJoined(messageRoomId)
                .stream()
                .map(messageRoomMember -> messageRoomMemberMapper.mapToDTO(messageRoomMember, new MessageRoomMemberDTO()))
                .toList();
    }


    public LocalDateTime updateLastSeen(final UUID messageRoomId) {
        UUID currentUserId = authUtils.getCurrentLoggedInUserId();
        final MessageRoomMember messageRoomMember = messageRoomMemberRepository.findByMessageRoomIdAndUserId(messageRoomId, currentUserId)
                .orElseThrow(() -> new NotFoundException(MessageRoomMember.class, "messageRoomId", messageRoomId.toString(), "userId", currentUserId.toString()));
        messageRoomMember.setLastSeen(LocalDateTime.now());
        messageRoomMemberRepository.save(messageRoomMember);
        return messageRoomMember.getLastSeen();
    }


    @Transactional
    public List<MessageRoomMemberDTO> addMembersToRoom(final UUID messageRoomId, final List<UUID> userIds) {
        // check if current user is admin of the room
        UUID currentUserId = isLoggedUserAdminMessageRoom(messageRoomId);
        // add the members
        return userIds.stream()
                .map(userId -> {
                    checkUserSettingsWhoCanAddYouToGroupChatAndThrowException(userId, currentUserId);
                    final MessageRoomMemberDTO messageRoomMemberDTO = new MessageRoomMemberDTO();
                    messageRoomMemberDTO.setMessageRoomId(messageRoomId);
                    messageRoomMemberDTO.setUserId(userId);
                    create(messageRoomMemberDTO);
                    return messageRoomMemberDTO;
                })
                .toList();
    }


    /**
     * Check the user settings of who can add you to group chat and throw an exception if the user cannot be added
     * @param userId the user id to check
     * @param currentUserId the current user id
     */
    public void checkUserSettingsWhoCanAddYouToGroupChatAndThrowException(UUID userId, UUID currentUserId) {
        final WhoCanAddYouToGroupChat whoCanAddYouToGroupChat = userSettingRepository.getWhoCanAddYouToGroupChat(userId);
        if(whoCanAddYouToGroupChat == null) {
            return;
        }
        if(whoCanAddYouToGroupChat.equals(WhoCanAddYouToGroupChat.ONLY_PEOPLE_YOU_FOLLOW)) {
            boolean isFollowing = userFollowRepository.existsByTargetIdAndActorId(currentUserId, userId);
            if(!isFollowing) {
                throw new AppException(HttpStatus.FORBIDDEN, "Some users cannot be added to the group chat cause they only allow people they follow to add them to group chats", null);
            }
        }
        else if(whoCanAddYouToGroupChat.equals(WhoCanAddYouToGroupChat.NO_ONE)) {
            throw new AppException(HttpStatus.FORBIDDEN, "Some users cannot be added to the group chat cause they don't allow anyone to add them to group chats", null);
        }
    }


    public void create(final MessageRoomMemberDTO messageRoomMemberDTO) {
        final MessageRoomMember messageRoomMember = new MessageRoomMember();
        messageRoomMemberMapper.mapToEntity(messageRoomMemberDTO, messageRoomMember);
        messageRoomMemberRepository.save(messageRoomMember);
    }


    /**
     * Delete a member from a room
     * @param messageRoomId
     * @param userId the user id to delete
     */
    public void delete(final UUID messageRoomId, final UUID userId) {
        // check if current user is admin of the room
        UUID currentUserId = isLoggedUserAdminMessageRoom(messageRoomId);
        // delete the member
        final MessageRoomMember messageRoomMember = messageRoomMemberRepository.findByMessageRoomIdAndUserId(messageRoomId, userId)
                .orElseThrow(() -> new NotFoundException(MessageRoomMember.class, "messageRoomId", messageRoomId.toString(), "userId", userId.toString()));
        messageRoomMemberRepository.delete(messageRoomMember);
    }


    /**
     * The current user leaves the chat
     * @param messageRoomId
     */
    public void leaveChat(final UUID messageRoomId) {
        UUID currentUserId = authUtils.getCurrentLoggedInUserId();
        final MessageRoomMember messageRoomMember = messageRoomMemberRepository.findByMessageRoomIdAndUserId(messageRoomId, currentUserId)
                .orElseThrow(() -> new NotFoundException(MessageRoomMember.class, "messageRoomId", messageRoomId.toString(), "userId", currentUserId.toString()));
        messageRoomMemberRepository.delete(messageRoomMember);
    }


    /**
     * Check if there are other admins in the room not including the current user
     * @param messageRoomId
     * @return
     */
    public boolean hasOtherAdmins(final UUID messageRoomId) {
        UUID currentUserId = authUtils.getCurrentLoggedInUserId();
        // if the user is not an admin, return true
        if(!isAdmin(messageRoomId, currentUserId)) {
            return true;
        }
        Long count = messageRoomMemberRepository.countByMessageRoomIdAndIsAdminAndUserIdNot(messageRoomId, true, currentUserId);
        return count > 0;
    }


    /**
     * Update the admin status of a user in a room
     * @param messageRoomId
     * @param userId the user id to update
     * @param isAdmin
     */
    public void updateAdmin(final UUID messageRoomId, final UUID userId, final boolean isAdmin) {
        // check if current user is admin of the room
        UUID currentUserId = isLoggedUserAdminMessageRoom(messageRoomId);
        // check if the userId is a member of the room
        final MessageRoomMember messageRoomMember = messageRoomMemberRepository.findByMessageRoomIdAndUserId(messageRoomId, userId)
                .orElseThrow(() -> new NotFoundException(MessageRoomMember.class, "messageRoomId", messageRoomId.toString(), "userId", userId.toString()));
        messageRoomMember.setAdmin(isAdmin);
        messageRoomMemberRepository.save(messageRoomMember);
    }


    /**
     * Check if the user is an admin of the room.
     * Also means the user exists and is a member of the room, and the room exists.
     * @param messageRoomId the message room id
     * @return the current user id
     * @throws AppException if the user is not an admin
     */
    public UUID isLoggedUserAdminMessageRoom(UUID messageRoomId) {
        UUID currentUserId = authUtils.getCurrentLoggedInUserId();
        if(!isAdmin(messageRoomId, currentUserId)) {
            throw new AppException(HttpStatus.UNAUTHORIZED, "You have to be an admin to do this action", null);
        }
        return currentUserId;
    }


    /**
     * Check if the user is an admin of the room.
     * Also means the user exists and is a member of the room, and the room exists.
     * @param messageRoomId
     * @param userId
     * @return true if the user is an admin, false otherwise
     */
    public boolean isAdmin(final UUID messageRoomId, final UUID userId) {
        return messageRoomMemberRepository.existsByMessageRoomIdAndUserIdAndIsAdmin(messageRoomId, userId, true);
    }
    
}
