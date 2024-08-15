package online.syncio.backend.utils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;
import java.util.concurrent.TimeUnit;
@Component
public class RedisRateLimiter {

    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    private static final long LIMIT = 100; // Max requests allowed
    private static final long WINDOW_SIZE_IN_MINUTES = 1; // Time window in minutes

    public boolean isAllowed(String userId) {
        String key = "rate_limiter:" + userId;
        Long requestCount = redisTemplate.opsForValue().increment(key);

        if (requestCount == 1) {
            redisTemplate.expire(key, WINDOW_SIZE_IN_MINUTES, TimeUnit.MINUTES);
        }
        System.out.println("User: " + userId + ", Request Count: " + requestCount);
        return requestCount <= LIMIT;
    }
}