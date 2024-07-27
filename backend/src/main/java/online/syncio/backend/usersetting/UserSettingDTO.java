package online.syncio.backend.usersetting;

import lombok.Data;

import java.util.UUID;

@Data
public class UserSettingDTO {
    private UUID id;
    private String findableByImageUrl;
    private UUID userId;
}
