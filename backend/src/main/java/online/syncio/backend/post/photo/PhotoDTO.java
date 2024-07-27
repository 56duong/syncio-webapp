package online.syncio.backend.post.photo;

import lombok.Data;
import online.syncio.backend.utils.Constants;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Data
public class PhotoDTO {

    private UUID id;

    private String url;

    private String altText;

    private UUID postId;

}
