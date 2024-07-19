package online.syncio.backend.notification;

import lombok.AllArgsConstructor;
import online.syncio.backend.comment.Comment;
import online.syncio.backend.comment.CommentRepository;
import online.syncio.backend.exception.NotFoundException;
import online.syncio.backend.like.LikeRepository;
import online.syncio.backend.post.Post;
import online.syncio.backend.post.PostRepository;
import online.syncio.backend.post.PostService;
import online.syncio.backend.user.User;
import online.syncio.backend.user.UserRepository;
import online.syncio.backend.user.UserService;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@AllArgsConstructor
public class NotificationMapper {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final LikeRepository likeRepository;

    @Transactional
    public NotificationDTO mapToDTO(final Notification notification, final NotificationDTO notificationDTO) {
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
            case COMMENT_POST, COMMENT_REPLY:
                notificationDTO.setActionPerformedId(notification.getActionPerformedId());
                notificationDTO.setPreviewText(commentRepository.getTextById(notification.getActionPerformedId())
                                                    .orElseThrow(() -> new NotFoundException(Comment.class, "id", notification.getActionPerformedId().toString())));
                if(notification.getActionType() == ActionEnum.COMMENT_POST) {
                    actorCount = commentRepository.countDistinctUsersByPostId(notification.getTargetId());
                }
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


    public Notification mapToEntity (final NotificationDTO notificationDTO, final Notification notification) {
        switch (notificationDTO.getActionType()) {
            case LIKE_POST, COMMENT_POST, COMMENT_REPLY:
                Post post = postRepository.findById(notificationDTO.getTargetId())
                        .orElseThrow(() -> new NotFoundException(Post.class, "id", notificationDTO.getTargetId().toString()));
                notification.setTargetId(post.getId());
                if (notificationDTO.getActionType() != ActionEnum.LIKE_POST) {
                    notification.setActionPerformedId(notificationDTO.getActionPerformedId());
                }
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
