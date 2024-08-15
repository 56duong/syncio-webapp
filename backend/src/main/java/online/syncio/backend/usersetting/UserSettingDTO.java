package online.syncio.backend.usersetting;

import lombok.Data;

import java.util.UUID;

@Data
public class UserSettingDTO {
    private UUID id;
    private String findableByImageUrl;
    private WhoCanAddYouToGroupChat whoCanAddYouToGroupChat;
    private WhoCanSendYouNewMessage whoCanSendYouNewMessage;
    private UUID userId;
}
