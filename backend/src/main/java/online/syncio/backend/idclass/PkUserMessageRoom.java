package online.syncio.backend.idclass;

import lombok.Data;
import online.syncio.backend.messageroom.MessageRoom;
import online.syncio.backend.user.User;

import java.io.Serializable;

@Data
public class PkUserMessageRoom implements Serializable {
    private User user;
    private MessageRoom messageRoom;
}

