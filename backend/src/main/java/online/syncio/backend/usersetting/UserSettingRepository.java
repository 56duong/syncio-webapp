package online.syncio.backend.usersetting;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserSettingRepository extends JpaRepository<UserSetting, UUID> {
    Optional<UserSetting> findByUserId(UUID userId);

    @Query(value = "SELECT us FROM UserSetting us JOIN us.user u WHERE us.findableByImageUrl IS NOT NULL AND u.status = 'ACTIVE'")
    List<UserSetting> findAllByFindableByImageUrlNotNullAndUserIsActive();

    @Query(value = "SELECT who_can_add_you_to_group_chat FROM user_setting WHERE user_id = :id", nativeQuery = true)
    WhoCanAddYouToGroupChat getWhoCanAddYouToGroupChat(UUID id);

    @Query(value = "SELECT who_can_send_you_new_message FROM user_setting WHERE user_id = :id", nativeQuery = true)
    WhoCanSendYouNewMessage getWhoCanSendYouNewMessage(UUID id);
}
