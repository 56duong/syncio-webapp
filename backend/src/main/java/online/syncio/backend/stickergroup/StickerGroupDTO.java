package online.syncio.backend.stickergroup;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class StickerGroupDTO {

    private Long id;

    @NotNull
    private String name;

    private LocalDateTime createdDate;

    @NotNull
    private Boolean flag;

    private UUID createdBy;
}
