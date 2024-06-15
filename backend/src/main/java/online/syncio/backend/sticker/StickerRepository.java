package online.syncio.backend.sticker;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StickerRepository extends JpaRepository<Sticker, UUID> {

    List<Sticker> findByStickerGroupIdOrderByCreatedDateDesc(Long stickerGroupId);

    List<Sticker> findByStickerGroupIdAndFlagTrueOrderByCreatedDateDesc(Long stickerGroupId);

    Optional<Sticker> findByName(String name);
}
