package online.syncio.backend.dashboard;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import online.syncio.backend.like.LikeDTO;
import online.syncio.backend.like.LikeService;
import online.syncio.backend.post.PostService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(value = "/api/v1/dashboard")
@AllArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    /**
     * Get the engagement metrics with the number of likes, comments and posts for the last n days.
     * @param days
     * @return
     */
    @GetMapping("/engagement-metrics")
    public ResponseEntity<List<EngagementMetricsDTO>> getEngagementMetrics(@RequestParam int days) {
        List<EngagementMetricsDTO> metricsDTO = dashboardService.getEngagementMetrics(days);
        return ResponseEntity.ok(metricsDTO);
    }


    /**
     * Get the outstanding users based on the number of posts, likes and comments for the last n days.
     * @param days
     * @param limit the top n users to return
     * @return
     */
    @GetMapping("/outstanding/{days}/{limit}")
    public ResponseEntity<List<OutstandingUserDTO>> getOutstandingUsers(@PathVariable(name = "days") final int days,
                                                                        @PathVariable(name = "limit") final int limit) {
        return ResponseEntity.ok(dashboardService.getOutstandingUsers(days, limit));
    }

}
