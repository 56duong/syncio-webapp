package online.syncio.backend.idclass;

import lombok.Data;
import online.syncio.backend.label.Label;
import online.syncio.backend.user.User;

import java.io.Serializable;

@Data
public class PkUserLabel implements Serializable {
    private User user;
    private Label label;
}
