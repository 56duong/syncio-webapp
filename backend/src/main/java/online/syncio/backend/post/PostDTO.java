package online.syncio.backend.post;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class PostDTO {

    private UUID id;

    private String caption;

    private List<String> photos;

    private LocalDateTime createdDate;

    @NotNull
    private Boolean flag;

    @NotNull
    private UUID createdBy;
}
