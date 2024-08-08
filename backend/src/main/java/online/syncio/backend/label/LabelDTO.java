package online.syncio.backend.label;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class LabelDTO {
        private UUID id;

        @NotNull
        private String name;

        private String description;

        @NotNull
        private Long price;

        private LocalDateTime createdDate;

        private UUID createdBy;

        private String labelURL;

        @NotNull
        private StatusEnum status = StatusEnum.ENABLED;

}
