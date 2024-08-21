package online.syncio.backend.label;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import online.syncio.backend.user.UserDTO;
import online.syncio.backend.user.UserProfile;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;



@Service
@RequiredArgsConstructor
public class LabelRedisService {
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper redisObjectMapper;

    public void clearByKey(String key) {
        redisTemplate.delete(key);
    }

    public void clear() {
        redisTemplate.getConnectionFactory().getConnection().flushAll();
    }
}