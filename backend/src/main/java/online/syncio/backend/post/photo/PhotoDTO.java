package online.syncio.backend.post.photo;

import lombok.Data;

import java.util.UUID;

@Data
public class PhotoDTO {

    private UUID id;

    private String url;

    private String altText;

    private UUID postId;

}
