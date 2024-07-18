package online.syncio.backend.post;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import online.syncio.backend.post.photo.PhotoDTO;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class PostDTO {

    private UUID id;

    @Max(2000)
    private String caption;

    private String audioURL;

    private List<PhotoDTO> photos;

    private LocalDateTime createdDate;

    @NotNull
    private Boolean flag;

    private String username;

    @NotNull
    private UUID createdBy;

    private PostEnum visibility;
}
