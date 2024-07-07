package online.syncio.backend.label;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class LabelResponseDTO {
    private UUID id;
    private String name;
    private Long price;
    private String labelURL;
    private StatusEnum status;
    private boolean isPurcharse;

    public LabelResponseDTO(Label label, boolean isPurcharse) {
        this.id = label.getId();
        this.name = label.getName();
        this.price = label.getPrice();
        this.labelURL = label.getLabelURL();
        this.status = label.getStatus();
        this.isPurcharse = isPurcharse;
    }

    public String getLabelURL() {
        return labelURL = "http://localhost:8080/api/v1/posts/images/" + labelURL;
    }
}
