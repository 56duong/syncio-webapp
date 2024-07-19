package online.syncio.backend.userlabelinfo;

import lombok.Data;

import java.util.UUID;

@Data
public class ULIResponseDTO {
    private UUID userId;
    private UUID labelId;
    private Boolean isShow;
    private String name;
    private String labelURL;

    public ULIResponseDTO(UserLabelInfoDTO userLabelInfoDTO, String name, String labelURL) {
        this.userId = userLabelInfoDTO.getUserId();
        this.labelId = userLabelInfoDTO.getLabelId();
        this.isShow = userLabelInfoDTO.getIsShow();
        this.name = name;
        this.labelURL = labelURL;
    }
}
