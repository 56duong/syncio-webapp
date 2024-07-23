package online.syncio.backend.post.photo;

import lombok.Data;
import org.springframework.beans.factory.annotation.Value;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Data
public class PhotoDTO {

    @Value("${url.frontend}")
    public String frontendUrl;

    private UUID id;

    private String url;

    private String altText;

    private UUID postId;



    private String cleanUrl(String url) {
        String prefixToRemove = frontendUrl + "/api/v1/posts/images/";
        if (url.startsWith(prefixToRemove)) {
            return url.substring(prefixToRemove.length());
        }
        return url;
    }
    public String getUrl() {
        url = cleanUrl(url);
        Path imagePath = Paths.get("uploads/" + url);

        System.out.println("imagePath: " + imagePath);
        if (Files.exists(imagePath)) {
            return frontendUrl + "/api/v1/posts/images/" + url;
        }
        else {
            return "https://your-s3-bucket-name.s3.your-region.amazonaws.com/" + url;
        }
    }


}
