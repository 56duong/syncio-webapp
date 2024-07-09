package online.syncio.backend.sticker;

import jakarta.persistence.*;
import lombok.Data;
import online.syncio.backend.stickergroup.StickerGroup;
import online.syncio.backend.user.User;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.UUID;

@Table(name = "sticker")
@Entity
@EntityListeners(AuditingEntityListener.class)
@Data
public class Sticker {
    @Id
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String name;

    @Column
    @CreatedDate
    private LocalDateTime createdDate;

    @Column(nullable = false)
    private Boolean flag;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @CreatedBy
    private User createdBy;

//    StickerGroup
    @ManyToOne
    @JoinColumn(name = "sticker_group_id", nullable = false)
    private StickerGroup stickerGroup;
}
