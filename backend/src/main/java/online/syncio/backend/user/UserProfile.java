package online.syncio.backend.user;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import online.syncio.backend.post.Post;
import online.syncio.backend.post.PostDTO;
import java.util.Set;
import online.syncio.backend.post.PostDTO;
import java.util.List;
import java.util.UUID;

@Data
public class UserProfile {
    private UUID id;

    @NotNull
    @Size(max = 30)
    private String username;

    @Size(max = 1000)
    private String avtURL;

    private String bio;

    private Set<PostDTO> posts;
    @JsonProperty("isCloseFriend")

    private boolean isCloseFriend;
    @JsonProperty("isFollowing")

    private boolean isFollowing;

    private long followerCount;

    private long followingCount;

    private List<PostDTO> postDTOList;

}
