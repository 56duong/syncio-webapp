package online.syncio.backend.sticker;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class StickerDTO {

    private UUID id;

    private String name;

    private LocalDateTime createdDate;

    @NotNull
    private Boolean flag;

    private UUID createdBy;

    @NotNull
    private Long stickerGroupId;

    private String imageUrl;
}
