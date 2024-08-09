package online.syncio.backend.dashboard;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EngagementMetricsDTO {
    private String date;
    private long likes;
    private long comments;
    private long posts;
}