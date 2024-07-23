package online.syncio.backend.post;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;


@Component
@NoArgsConstructor
public class PostListener {


    @Autowired
    private IPostRedisService postRedisService;
    private static final Logger logger = LoggerFactory.getLogger(PostListener.class);

    public PostListener(IPostRedisService postRedisService) {
        this.postRedisService = postRedisService;
    }



    @PrePersist
    public void prePersist(Post post) {
        logger.info("prePersist");
    }

    @PostPersist
    public void postPersist(Post post) {
        // Update Redis cache
        logger.info("postPersist");
        postRedisService.clear();
    }

    @PreUpdate
    public void preUpdate(Post post) {

        logger.info("preUpdate");
    }

    @PostUpdate
    public void postUpdate(Post post) {
        // Update Redis cache
        logger.info("postUpdate");
        postRedisService.clear();
    }

    @PreRemove
    public void preRemove(Post product) {

        logger.info("preRemove");
    }

    @PostRemove
    public void postRemove(Post product) {

        logger.info("postRemove");
        postRedisService.clear();
    }
}
