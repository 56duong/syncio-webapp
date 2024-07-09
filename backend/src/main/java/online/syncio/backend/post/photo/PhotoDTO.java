package online.syncio.backend.post.photo;

import lombok.Data;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Data
public class PhotoDTO {

    private UUID id;

    private String url;

    private String altText;

    private UUID postId;

    public String getUrl() {
        Path imagePath = Paths.get("uploads/" + url);
        if (Files.exists(imagePath)) {
            return "http://localhost:8080/api/v1/posts/images/" + url;
        }
        else {
            return "https://your-s3-bucket-name.s3.your-region.amazonaws.com/" + url;
        }
    }

}
