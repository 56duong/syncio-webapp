package online.syncio.backend.postcollection;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class PostCollectionDTO {

    private UUID id;

    @NotNull
    @Size(max = 255)
    private String name;

    @Size(max = 2000)
    private String description;

    private LocalDateTime createdDate;

    private PostCollectionEnum status;

    private UUID createdById;

    private String createdByUsername;

    private String imageUrl;
}
