package online.syncio.backend.userlabelinfo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserLabelInfoRepository extends JpaRepository<UserLabelInfo, Long>{
    Optional<UserLabelInfo> findByLabelIdAndUserId(UUID labelId, UUID userId);


    @Query("SELECT u FROM UserLabelInfo u WHERE u.user.id = :user_id")
    List<UserLabelInfo> findByUserId(UUID user_id);
}
