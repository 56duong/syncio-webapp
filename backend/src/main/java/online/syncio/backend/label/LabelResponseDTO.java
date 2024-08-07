package online.syncio.backend.label;

import lombok.Data;

import online.syncio.backend.utils.Constants;
import org.springframework.beans.factory.annotation.Value;


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
    private int quantitySold;

    public LabelResponseDTO(Label label, boolean isPurcharse, int quantitySold) {
        this.id = label.getId();
        this.name = label.getName();
        this.price = label.getPrice();
        this.labelURL = label.getLabelURL();
        this.status = label.getStatus();
        this.isPurcharse = isPurcharse;
        this.quantitySold = quantitySold;
    }

    public String getLabelURL() {

        return labelURL = Constants.BACKEND_URL + "/api/v1/posts/images/" + labelURL;
    }
}
