package online.syncio.backend.userlabelinfo;

import lombok.Data;

import java.util.UUID;

@Data
public class UserLabelInfoDTO {
    private UUID labelId;
    private UUID userId;
    private Boolean isShow;
}
