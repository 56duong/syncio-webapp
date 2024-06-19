package online.syncio.backend.userlabelinfo;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
public class UserLabelInfoDTO {
    private UUID labelId;
    private UUID userId;
    private Boolean isShow;
}
