package online.syncio.backend.post;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class CreatePostDTO {

    private UUID id;

    private String caption;

    private List<MultipartFile> photos;

    private LocalDateTime createdDate;

    @NotNull
    private Boolean flag;

    @NotNull
    private UUID createdBy;
}
