package online.syncio.backend.post;

import com.fasterxml.jackson.core.JsonProcessingException;
import org.springframework.data.domain.Page;

import java.util.List;

public interface IPostRedisService {

    void clear();//clear cache

    Page<PostDTO> findAllPostsInCache(String cacheKey)throws JsonProcessingException;

    void cachePosts(String cacheKey, Page<PostDTO> posts)throws JsonProcessingException;
}
