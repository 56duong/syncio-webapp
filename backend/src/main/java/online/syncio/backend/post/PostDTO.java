package online.syncio.backend.post;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

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
        return photos.stream()
                .map(photo -> "http://localhost:8080/api/v1/posts/images/" + photo)
                .collect(Collectors.toList());
    }

    private LocalDateTime createdDate;

    @NotNull
    private Boolean flag;

    @NotNull
    private UUID createdBy;
}
