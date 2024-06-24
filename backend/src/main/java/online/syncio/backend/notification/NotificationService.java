package online.syncio.backend.notification;

import lombok.RequiredArgsConstructor;
import online.syncio.backend.comment.CommentRepository;
import online.syncio.backend.exception.NotFoundException;
import online.syncio.backend.like.LikeRepository;
import online.syncio.backend.post.Post;
import online.syncio.backend.post.PostRepository;
import online.syncio.backend.user.User;
import online.syncio.backend.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final LikeRepository likeRepository;

    //    CRUD
    public NotificationDTO create (final NotificationDTO notificationDTO) {
        final Notification notification = mapToEntity(notificationDTO, new Notification());
        notificationRepository.save(notification);
        return mapToDTO(notification, new NotificationDTO());
    }

    public List<NotificationDTO> findByRecipientId (final UUID id) {
        List<Notification> notifications = notificationRepository.findByRecipientId(id);
        return notifications.stream()
                    .map(notification -> mapToDTO(notification, new NotificationDTO()))
                    .collect(Collectors.toList());
    }

    public List<NotificationDTO> findByRecipientIdAndCreatedDateLastMonth (final UUID id) {
        List<Notification> notifications = notificationRepository.findByRecipientIdAndCreatedDateAfterOrderByCreatedDateDesc(id, LocalDateTime.now().minusMonths(1));
        return notifications.stream()
                .map(notification -> mapToDTO(notification, new NotificationDTO()))
                .collect(Collectors.toList());
    }

    @Transactional
    public void updateNotificationStates (final List<NotificationDTO> notificationDTOs) {
        for (NotificationDTO notificationDTO : notificationDTOs) {
            UUID targetId = notificationDTO.getTargetId();
            UUID actorId = notificationDTO.getActorId();
            ActionEnum actionType = notificationDTO.getActionType();
            StateEnum newState = notificationDTO.getState();
            notificationRepository.updateNotificationState(targetId, actorId, actionType, newState);
        }
    }


    //    MAPPER
    @Transactional
    protected NotificationDTO mapToDTO(final Notification notification, final NotificationDTO notificationDTO) {
        notificationDTO.setTargetId(notification.getTargetId());
        notificationDTO.setActorId(notification.getActor().getId());
        notificationDTO.setActionType(notification.getActionType());
        notificationDTO.setRedirectURL(notification.getRedirectURL());
        notificationDTO.setCreatedDate(notification.getCreatedDate());
        notificationDTO.setState(notification.getState());
        notificationDTO.setRecipientId(notification.getRecipient().getId());

        Long actorCount = null;
        switch (notification.getActionType()) {
            case LIKE_POST:
                actorCount = likeRepository.countByPostId(notification.getTargetId());
                notificationDTO.setPreviewText(postRepository.getCaptionById(notification.getTargetId()));
                break;
            case COMMENT_POST:
                actorCount = commentRepository.countDistinctUsersByPostId(notification.getTargetId());
                break;
            case COMMENT_REPLY:
                break;
            case FOLLOW:
                break;
            default:
                break;
        }
        notificationDTO.setActorCount(actorCount);

        String firstPhoto = postRepository.findFirstPhotoIdByPostId(notificationDTO.getTargetId());
        if (firstPhoto != null) {
            notificationDTO.setImageURL(firstPhoto);
        }

        return notificationDTO;
    }

    private Notification mapToEntity (final NotificationDTO notificationDTO, final Notification notification) {
        switch (notificationDTO.getActionType()) {
            case LIKE_POST, COMMENT_POST, COMMENT_REPLY:
                Post post = postRepository.findById(notificationDTO.getTargetId())
                                .orElseThrow(() -> new NotFoundException(Post.class, "id", notificationDTO.getTargetId().toString()));
                notification.setTargetId(post.getId());
                break;
            case FOLLOW:
                User user = userRepository.findById(notificationDTO.getTargetId())
                               .orElseThrow(() -> new NotFoundException(User.class, "id", notificationDTO.getTargetId().toString()));
                notification.setTargetId(user.getId());
                break;
            default:
                break;
        }

        final User actor = userRepository.findById(notificationDTO.getActorId())
                              .orElseThrow(() -> new NotFoundException(User.class, "id", notificationDTO.getActorId().toString()));
        notification.setActor(actor);

        notification.setActionType(notificationDTO.getActionType());
        notification.setRedirectURL(notificationDTO.getRedirectURL());
        notification.setCreatedDate(notificationDTO.getCreatedDate());
        notification.setState(notificationDTO.getState());

        final User recipient = userRepository.findById(notificationDTO.getRecipientId())
                                  .orElseThrow(() -> new NotFoundException(User.class, "id", notificationDTO.getRecipientId().toString()));
        notification.setRecipient(recipient);

        return notification;
    }

}
