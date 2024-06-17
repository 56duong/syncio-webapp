package online.syncio.backend.label;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class LabelDTO {
        private UUID id;
        private String name;
        private String description;
        private Double price;
        private LocalDateTime createdDate;
        private UUID createdBy;
}
