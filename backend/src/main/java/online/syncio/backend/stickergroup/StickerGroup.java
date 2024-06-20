package online.syncio.backend.stickergroup;

import jakarta.persistence.*;
import lombok.Data;
import online.syncio.backend.sticker.Sticker;
import online.syncio.backend.user.User;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.Set;

@Table(name = "sticker_group")
@Entity
@EntityListeners(AuditingEntityListener.class)
@Data
public class StickerGroup {
    @Id
    @Column(nullable = false, updatable = false)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

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

//    Sticker
    @OneToMany(mappedBy = "stickerGroup")
    private Set<Sticker> stickers;
}
