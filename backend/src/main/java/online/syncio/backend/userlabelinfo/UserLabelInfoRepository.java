package online.syncio.backend.userlabelinfo;

import online.syncio.backend.label.LabelDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserLabelInfoRepository extends JpaRepository<UserLabelInfo, Long>{
    Optional<UserLabelInfo> findByLabelIdAndUserId(UUID labelId, UUID userId);


    @Query("SELECT u FROM UserLabelInfo u WHERE u.user.id = :user_id")
    List<UserLabelInfo> findByUserId(UUID user_id);

    Optional<UserLabelInfo> findByUserIdAndIsShow(UUID userId, boolean isShow);
}
