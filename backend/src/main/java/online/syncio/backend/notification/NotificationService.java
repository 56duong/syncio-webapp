package online.syncio.backend.notification;

import lombok.RequiredArgsConstructor;
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
    private final NotificationMapper notificationMapper;


    public NotificationDTO create (final NotificationDTO notificationDTO) {
        final Notification notification = notificationMapper.mapToEntity(notificationDTO, new Notification());
        notificationRepository.save(notification);
        return notificationMapper.mapToDTO(notification, new NotificationDTO());
    }


    public List<NotificationDTO> findByRecipientIdAndCreatedDateLastMonth (final UUID id) {
        List<Notification> notifications = notificationRepository.findByRecipientIdAndCreatedDateAfterOrderByCreatedDateDesc(id, LocalDateTime.now().minusMonths(1));
        return notifications.stream()
                .map(notification -> notificationMapper.mapToDTO(notification, new NotificationDTO()))
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

}
