package online.syncio.backend.userlabelinfo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserLabelInfoRepository extends JpaRepository<UserLabelInfo, Long>{
    Optional<UserLabelInfo> findByLabelIdAndUserId(UUID labelId, UUID userId);
}
