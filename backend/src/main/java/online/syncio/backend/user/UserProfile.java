package online.syncio.backend.user;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.UUID;

@Data
public class UserProfile {
    private UUID id;

    @NotNull
    @Size(max = 30)
    private String username;

    private String bio;

    @JsonProperty("isCloseFriend")
    private boolean isCloseFriend;

    @JsonProperty("isFollowing")
    private boolean isFollowing;

    private long followerCount;

    private long followingCount;

}
