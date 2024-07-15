package online.syncio.backend.post;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.beans.Visibility;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class CreatePostDTO {

    private UUID id;

    private String caption;

    private List<MultipartFile> photos;

    private MultipartFile audio;

    private LocalDateTime createdDate;

    private PostEnum visibility;

    @NotNull
    private Boolean flag;

    private UUID createdBy;
}
