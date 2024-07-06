package online.syncio.backend.post;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.core.type.TypeReference;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PostRedisService implements  IPostRedisService{

    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper redisObjectMapper;



    @Override
    public void clear() {
        redisTemplate.getConnectionFactory().getConnection().flushAll();
    }

    @Override
    public Page<PostDTO> findAllPostsInCache(String key) throws JsonProcessingException {


        String json = (String) redisTemplate.opsForValue().get(key);
        Page<PostDTO> results = json != null ?
                redisObjectMapper.readValue(json, new TypeReference<PageImpl<PostDTO>>() {}) :
                null;
        return results;
    }

    @Override
    public void cachePosts(String cacheKey, Page<PostDTO> posts) throws JsonProcessingException {
        if (posts instanceof PageImpl) {
            String json = redisObjectMapper.writeValueAsString(posts);
            redisTemplate.opsForValue().set(cacheKey, json);
        } else {
            throw new IllegalArgumentException("The provided Page must be an instance of PageImpl");
        }
    }
}
