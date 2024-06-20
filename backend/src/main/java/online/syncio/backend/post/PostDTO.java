package online.syncio.backend.post;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.core.io.UrlResource;
import org.springframework.web.multipart.MultipartFile;

import java.beans.Transient;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Data
public class PostDTO {

    private UUID id;

    private String caption;

    private List<String> photos;
    public List<String> getPhotos() {
        String baseUrl = "http://localhost:8080/uploads/";
        return photos.stream()
                .map(photo ->{
                    Path imagePath = Paths.get("uploads/" + photo);
                    if (Files.exists(imagePath)) {
                        return "http://localhost:8080/api/v1/posts/images/" + photo;
                    } else {
                        return "https://your-s3-bucket-name.s3.your-region.amazonaws.com/" + photo; // URL S3

                    }
                })
                .collect(Collectors.toList());
    }

    private LocalDateTime createdDate;

    @NotNull
    private Boolean flag;

    @NotNull
    private UUID createdBy;
}
