package online.syncio.backend.dashboard;

import lombok.RequiredArgsConstructor;
import online.syncio.backend.exception.NotFoundException;
import online.syncio.backend.post.PostRepository;
import online.syncio.backend.user.User;
import online.syncio.backend.user.UserDTO;
import online.syncio.backend.user.UserMapper;
import online.syncio.backend.user.UserRepository;
import org.springframework.stereotype.Service;

import java.nio.ByteBuffer;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final UserMapper userMapper;


    public List<EngagementMetricsDTO> getEngagementMetrics(int days) {
        LocalDateTime startDate = LocalDateTime.now().minusDays(days);

        // Single query to get likes, comments, and posts data
        List<Map<String, Object>> engagementData = postRepository.countEngagementMetricsSince(startDate);

        // Process the data and create EngagementMetricsDTO objects
        Map<String, EngagementMetricsDTO> dailyMetricsMap = engagementData.stream()
                .collect(Collectors.toMap(
                        data -> data.get("date").toString(),
                        data -> new EngagementMetricsDTO(
                                data.get("date").toString(),
                                (long) data.get("likes"),
                                (long) data.get("comments"),
                                (long) data.get("posts")
                        )
                ));

        // Generate a list of all dates within the range
        List<String> allDates = IntStream.range(0, days)
                .mapToObj(i -> LocalDate.now().minusDays(i).toString())
                .toList();

        // Ensure all dates have an entry
        for (String date : allDates) {
            dailyMetricsMap.putIfAbsent(date, new EngagementMetricsDTO(date, 0, 0, 0));
        }

        List<EngagementMetricsDTO> dailyMetrics = new ArrayList<>(dailyMetricsMap.values());
        dailyMetrics.sort(Comparator.comparing(EngagementMetricsDTO::getDate));
        return dailyMetrics;
    }


    public List<OutstandingUserDTO> getOutstandingUsers(int days, int limit) {
        LocalDateTime startDate = LocalDateTime.now().minusDays(days);

        List<Object[]> topUsersByInteractions = userRepository.findTopUsersByInteractionsInNDays(startDate, limit);
        // Convert to DTOs
        List<OutstandingUserDTO> outstandingUsers = new ArrayList<>();
        for (Object[] data : topUsersByInteractions) {
            // Convert the byte[] to UUID
            ByteBuffer bb = ByteBuffer.wrap((byte[]) data[0]);
            long firstLong = bb.getLong();
            long secondLong = bb.getLong();
            UUID userId = new UUID(firstLong, secondLong);

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new NotFoundException(User.class, "id", userId.toString()));

            UserDTO userDTO = userMapper.mapToDTO(user, new UserDTO());

            // Get the score
            Long score = (Long) data[1];

            outstandingUsers.add(new OutstandingUserDTO(userDTO, score));
        }

        return outstandingUsers;
    }

}
