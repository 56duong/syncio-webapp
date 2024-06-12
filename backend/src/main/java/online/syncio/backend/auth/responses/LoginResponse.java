package online.syncio.backend.auth.responses;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class LoginResponse {
    @JsonProperty("message")
    private String message;

    @JsonProperty("token")
    private String token;

    @JsonProperty("refresh_token")
    private String refreshToken;
    private String tokenType = "Bearer";
    //user's detail
    private UUID id;
    private String username;
    private String email;
    private String bio;
    private List<String> roles;
}