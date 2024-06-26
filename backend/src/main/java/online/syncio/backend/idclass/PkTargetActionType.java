package online.syncio.backend.idclass;

import lombok.Data;
import online.syncio.backend.notification.ActionEnum;

import java.io.Serializable;
import java.util.UUID;

@Data
public class PkTargetActionType implements Serializable {
    private UUID targetId;
    private ActionEnum actionType;
}
