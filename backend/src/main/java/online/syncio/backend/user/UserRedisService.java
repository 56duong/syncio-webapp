package online.syncio.backend.user;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserRedisService {
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper redisObjectMapper;
    public boolean usernameExists(String username) {
        return Boolean.TRUE.equals(redisTemplate.hasKey("username:" + username));
    }

    public boolean emailExists(String email) {
        return Boolean.TRUE.equals(redisTemplate.hasKey("email:" + email));
    }

    public void addUserToCache(UserDTO user) {
        redisTemplate.opsForValue().set("username:" + user.getUsername(), user.getUsername());
        redisTemplate.opsForValue().set("email:" + user.getEmail(), user.getEmail());
    }

    public List<UserDTO> getCachedUsers(String username) {
        String key = "users:" + username;
        String json = (String) redisTemplate.opsForValue().get(key);
        if (json != null) {
            try {
                return redisObjectMapper.readValue(json, new TypeReference<List<UserDTO>>() {});
            } catch (JsonProcessingException e) {

                return null;
            }
        }
        return null;
    }

    public void cacheUsers(String username, List<UserDTO> users) {
        String key = "users:" + username;
        try {
            String json = redisObjectMapper.writeValueAsString(users);
            redisTemplate.opsForValue().set(key, json); // Cache for 1 hour
        } catch (JsonProcessingException e) {

        }
    }

    public UserProfile getCachedUserProfile(UUID userId) {
        String key = "userProfile:" + userId;
        String json = redisTemplate.opsForValue().get(key);
        if (json != null) {
            try {
                return redisObjectMapper.readValue(json, UserProfile.class);
            } catch (JsonProcessingException e) {
                throw new RuntimeException(e);
            }
        }
        return null;
    }

    public void cacheUserProfile(UUID userId, UserProfile userProfile) {
        String key = "userProfile:" + userId;
        try {
            String json = redisObjectMapper.writeValueAsString(userProfile);
            redisTemplate.opsForValue().set(key, json);
        } catch (JsonProcessingException e) {
            System.out.println("Error caching user profile "+ e);
            throw new RuntimeException(e);
        }
    }
    public void invalidateUserProfileCache(UUID userId) {
        String key = "userProfile:" + userId;
        redisTemplate.delete(key); // Xóa cache theo key
    }


}