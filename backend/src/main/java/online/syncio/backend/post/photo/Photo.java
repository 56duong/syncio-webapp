package online.syncio.backend.post.photo;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Data;
import online.syncio.backend.post.Post;
import org.hibernate.annotations.GenericGenerator;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Entity
@Table(name = "post_photos")
@EntityListeners(AuditingEntityListener.class)
@Data
public class Photo {
    @Value("${url.frontend}")
    public String frontendUrl;

    @Id
    @Column(nullable = false, updatable = false)
    @GenericGenerator(name = "uuid", strategy = "org.hibernate.id.UUIDGenerator")
    @GeneratedValue(generator = "uuid")
    private UUID id;

    private String url;

    private String altText;

    @ManyToOne
    @JoinColumn(name = "post_id")
    private Post post;

    @JsonIgnore
    public String getImageUrl(String storageType) {
        if("firebase".equals(storageType)) {
            return "https://firebasestorage.googleapis.com/v0/b/syncio-bf6ca.appspot.com/o/" + url.replaceAll("/", "%2F") + "?alt=media";
        }
        else {
            Path imagePath = Paths.get("uploads/" + url);
            if (Files.exists(imagePath)) {
                return frontendUrl + "/api/v1/posts/images/" + url;
            }
            else {
                return "https://your-s3-bucket-name.s3.your-region.amazonaws.com/" + url;
            }
        }
    }
}
