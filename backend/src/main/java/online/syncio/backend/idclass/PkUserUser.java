package online.syncio.backend.idclass;

import lombok.Data;
import online.syncio.backend.post.Post;
import online.syncio.backend.user.User;

import java.io.Serializable;

@Data
public class PkUserUser implements Serializable {
    private User actor;
    private User target;
}
