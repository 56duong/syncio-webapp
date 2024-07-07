package online.syncio.backend.notification;

import online.syncio.backend.idclass.PkTargetActionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, PkTargetActionType> {

    List<Notification> findByRecipientIdAndCreatedDateAfterOrderByCreatedDateDesc (final UUID id, final LocalDateTime createdDate);

    /**
     * Update the state of a notification
     * @param targetId the entity (post or user) that the action was performed on
     * @param actorId the latest user who performed the action
     * @param actionType the type of action
     * @param newState the new state of the notification
     */
    @Modifying
    @Query("UPDATE Notification n SET n.state = :newState WHERE n.targetId = :targetId AND n.actor.id = :actorId AND n.actionType = :actionType")
    void updateNotificationState(@Param("targetId") UUID targetId, @Param("actorId") UUID actorId, @Param("actionType") ActionEnum actionType, @Param("newState") StateEnum newState);
}
