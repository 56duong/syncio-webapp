package online.syncio.backend.imagecaption;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class CaptionDTO {
    @JsonProperty("generated_text")
    private String generatedText;
}
