package online.syncio.backend.label;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import online.syncio.backend.user.UserDTO;
import online.syncio.backend.user.UserProfile;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;


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

    public List<LabelDTO> findALl() {
        String key = "labels";
        String json = (String) redisTemplate.opsForValue().get(key);
        if (json != null) {
            try {
                return redisObjectMapper.readValue(json, new TypeReference<List<LabelDTO>>() {});
            } catch (JsonProcessingException e) {
                return null;
            }
        }
        return null;
    }

    public void cacheLabels(List<LabelDTO> labels) {
        String key = "labels";
        try {
            String json = redisObjectMapper.writeValueAsString(labels);
            redisTemplate.opsForValue().set(key, json); // Cache for 1 hour
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }
    }

    //getAllLabelWithPurcharseStatus
        public List<LabelResponseDTO> getAllLabelWithPurcharseStatus(UUID user_id) {
            String key = "labels:" + user_id;
            String json = (String) redisTemplate.opsForValue().get(key);
            if (json != null) {
                try {
                    return redisObjectMapper.readValue(json, new TypeReference<List<LabelResponseDTO>>() {});
                } catch (JsonProcessingException e) {
                    e.printStackTrace();
                }
            }
            return null;

        }
}