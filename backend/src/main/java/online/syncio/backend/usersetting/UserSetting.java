package online.syncio.backend.usersetting;

import jakarta.persistence.*;
import lombok.Data;
import online.syncio.backend.user.User;
import org.hibernate.annotations.GenericGenerator;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Table(name = "user_setting")
@Entity
@EntityListeners(AuditingEntityListener.class)
@Data
public class UserSetting {
    @Id
    @Column(nullable = false, updatable = false)
    @GenericGenerator(name = "uuid", strategy = "org.hibernate.id.UUIDGenerator")
    @GeneratedValue(generator = "uuid")
    private UUID id;

    private String findableByImageUrl;

    @Enumerated(EnumType.STRING)
    private WhoCanAddYouToGroupChat whoCanAddYouToGroupChat;

    @Enumerated(EnumType.STRING)
    private WhoCanSendYouNewMessage whoCanSendYouNewMessage;

//    User
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    public String getImageUrl(String storageType) {
        String url = "user-setting/" + findableByImageUrl;
        if("firebase".equals(storageType)) {
            return "https://firebasestorage.googleapis.com/v0/b/syncio-bf6ca.appspot.com/o/" + url.replaceAll("/", "%2F") + "?alt=media";
        }
        else {
            Path imagePath = Paths.get("uploads/" + url);
            if (Files.exists(imagePath)) {
                return "http://localhost:8080/api/v1/images/" + url;
            }
            return null;
        }
    }
}
