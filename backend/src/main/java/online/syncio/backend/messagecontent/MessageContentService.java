package online.syncio.backend.messagecontent;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import online.syncio.backend.exception.NotFoundException;
import online.syncio.backend.messageroom.MessageRoom;
import online.syncio.backend.messageroommember.MessageRoomMember;
import online.syncio.backend.messageroommember.MessageRoomMemberRepository;
import online.syncio.backend.user.User;
import online.syncio.backend.user.UserRepository;
import online.syncio.backend.utils.AuthUtils;
import online.syncio.backend.utils.FileUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MessageContentService {

    private final MessageContentRepository messageContentRepository;
    private final MessageContentMapper messageContentMapper;
    private final UserRepository userRepository;
    private final FileUtils fileUtils;
    private final AuthUtils authUtils;
    private final MessageRoomMemberRepository messageRoomMemberRepository;

    @Value("${firebase.storage.type}")
    private String storageType;


    public List<MessageContentDTO> findAll() {
        final List<MessageContent> messageContents = messageContentRepository.findAll(Sort.by("createdDate"));
        return messageContents.stream()
                .map(messageContent -> messageContentMapper.mapToDTO(messageContent, new MessageContentDTO()))
                .toList();
    }


    public List<MessageContentDTO> findByMessageRoomId(final UUID messageRoomId) {
        final UUID currentUserId = authUtils.getCurrentLoggedInUserId();
        final MessageRoomMember messageRoomMember = messageRoomMemberRepository.findByMessageRoomIdAndUserId(messageRoomId, currentUserId)
                .orElseThrow(() -> new NotFoundException(MessageRoomMember.class, "messageRoomId", messageRoomId.toString(), "userId", currentUserId.toString()));
        return messageContentRepository.findByMessageRoomIdOrderByDateSentAsc(messageRoomId)
                .stream()
                .map(messageContent -> messageContentMapper.mapToDTO(messageContent, new MessageContentDTO()))
                .toList();
    }


    public UUID create(final MessageContentDTO messageContentDTO) {
        final MessageContent messageContent = new MessageContent();
        messageContentMapper.mapToEntity(messageContentDTO, messageContent);
        return messageContentRepository.save(messageContent).getId();
    }


    @Transactional
    public List<String> uploadPhotos(final List<MultipartFile> photos) {
        return photos.stream()
                .map(photo -> {
                    try {
                        return fileUtils.storeFile(photo, "messages", false);
                    } catch (IOException e) {
                        throw new RuntimeException("Could not save photo: " + photo.getOriginalFilename());
                    }
                })
                .toList();
    }


    /**
     * Send a notification to a specific message room
     * @param messageRoom
     * @param userId
     * @param type
     * @param message
     * @return
     */
    public boolean sendNotification(final MessageRoom messageRoom, final UUID userId, TypeEnum type, String message) {
        MessageContent messageContent = new MessageContent();
        messageContent.setMessageRoom(messageRoom);
        messageContent.setUser(userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException(User.class, "id", userId.toString())));
        messageContent.setType(type);
        messageContent.setMessage(message);
        messageContentRepository.save(messageContent);
        return true;
    }

}
