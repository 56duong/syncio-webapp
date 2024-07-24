package online.syncio.backend.notification;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Data;
import online.syncio.backend.utils.Constants;
import org.springframework.beans.factory.annotation.Value;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class NotificationDTO {

    private UUID targetId;

    private UUID actionPerformedId;

    private UUID actorId;

    private ActionEnum actionType;

    private String redirectURL;

    private LocalDateTime createdDate;

    @Enumerated(EnumType.STRING)
    private StateEnum state = StateEnum.UNSEEN;

    private UUID recipientId;

    /**
     * The total number of users who performed that action (not including the last user).
     */
    private Long actorCount;

    /**
     * The url of the image, if the notification is related to a post.
     */
    private String imageURL;

    /**
     * The preview text of the post, if the notification is related to a post.
     */
    private String previewText;

    public String getImageURL() {
        return imageURL == null ? null : Constants.BACKEND_URL + "/api/v1/images/" + imageURL;
    }

}
