package online.syncio.backend.dashboard;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import online.syncio.backend.user.UserDTO;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class OutstandingUserDTO {
    private UserDTO user;
    private long score;
}
