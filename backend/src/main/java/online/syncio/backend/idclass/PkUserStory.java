package online.syncio.backend.idclass;

import lombok.Data;
import online.syncio.backend.story.Story;
import online.syncio.backend.user.User;

import java.io.Serializable;

@Data
public class PkUserStory implements Serializable {
    private Story story;
    private User user;
}
