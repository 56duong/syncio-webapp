package online.syncio.backend.utils;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import online.syncio.backend.config.RabbitMQConfig;
import online.syncio.backend.post.Post;
import online.syncio.backend.post.PostService;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class RabbitMQListener {

    private final PostService postService;
    @RabbitListener(queues = "image_verification_response_queue_spring")
    public void receiveMessageFromFastAPI(Map<String, Object> message) {
        Boolean nudity = (Boolean) message.get("nudity");
        String postIdString = (String) message.get("postId");

        if (nudity != null && nudity) {
            try {
                UUID postId = UUID.fromString(postIdString);
                Optional<Post> updatedPost = postService.blockPost(postId);
                if (updatedPost.isPresent()) {
                    System.out.println("Post with ID " + postId + " has been successfully blocked.");
                } else {
                    System.out.println("No post found with ID " + postId + ".");
                }
            } catch (IllegalArgumentException e) {
                System.out.println("Invalid UUID format for post ID: " + postIdString);
            }
        } else {
            System.out.println("No action required, nudity not detected or invalid message.");
        }
    }
}