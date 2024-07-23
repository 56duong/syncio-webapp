package online.syncio.backend.label;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.beans.factory.annotation.Value;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.stream.Collectors;

@Data
public class LabelDTO {

        @Value("${url.frontend}")
        public String frontendUrl;

        private UUID id;

        @NotNull
        private String name;

        @NotNull
        private String description;

        @NotNull
        private Long price;

        private LocalDateTime createdDate;

        private UUID createdBy;

        private String labelURL;

        @NotNull
        private StatusEnum status = StatusEnum.ENABLED;
        public String getLabelURL() {
                return labelURL = frontendUrl + "/api/v1/posts/images/" + labelURL;
        }
}
