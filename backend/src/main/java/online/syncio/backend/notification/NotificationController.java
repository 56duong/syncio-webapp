package online.syncio.backend.notification;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(value = "${api.prefix}/notifications")
@AllArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/{id}")
    public ResponseEntity<List<NotificationDTO>> findByRecipientId(@PathVariable(name = "id") final UUID id) {
        return ResponseEntity.ok(notificationService.findByRecipientIdAndCreatedDateLastMonth(id));
    }

    @PostMapping
    public ResponseEntity<NotificationDTO> createNotification(@RequestBody @Valid final NotificationDTO notificationDTO) {
        return ResponseEntity.status(HttpStatus.CREATED).body(notificationService.create(notificationDTO));
    }

    /**
     * This method is used to send a notification to a specific user.
     * The @MessageMapping("/notification/{userId}") annotation means that this method
     * will be invoked when a message is sent to the "/notification/{userId}" destination.
     * The @SendTo("/topic/notification/{userId}") annotation means that the return value of this method
     * will be sent to the "/topic/notification/{userId}" destination.
     * @param userId the post id
     * @param token the token
     * @param notificationDTO the notification
     * @return the notification
     */
    @MessageMapping("/notification/{userId}")
    @SendTo("/topic/notification/{userId}")
    public NotificationDTO addNotification(@DestinationVariable final UUID userId,
                                 @Header("token") final String token,
                                 final NotificationDTO notificationDTO) {
        NotificationDTO createdNotificationDTO =  notificationService.create(notificationDTO);
        return createdNotificationDTO;
    }

    /**
     * Update the state of a list of notifications.
     * @param notificationDTOs the list of notifications with the new state
     */
    @PatchMapping
    public ResponseEntity<Void> updateNotificationStates(@RequestBody final List<NotificationDTO> notificationDTOs) {
        notificationService.updateNotificationStates(notificationDTOs);
        return ResponseEntity.ok().build();
    }
    
}
