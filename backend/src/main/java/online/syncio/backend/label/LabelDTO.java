package online.syncio.backend.label;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.stream.Collectors;

@Data
public class LabelDTO {
        private UUID id;
        private String name;
        private String description;
        private Double price;
        private LocalDateTime createdDate;
        //private UUID createdBy;
        private String labelURL;
        public String getLabelURL() {
                return labelURL = "http://localhost:8080/api/v1/posts/images/" + labelURL;
        }
}
