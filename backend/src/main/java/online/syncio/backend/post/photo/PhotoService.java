package online.syncio.backend.post.photo;

import lombok.RequiredArgsConstructor;
import online.syncio.backend.exception.NotFoundException;
import online.syncio.backend.post.Post;
import online.syncio.backend.post.PostRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PhotoService {
    private final PhotoRepository photoRepository;
    private final PostRepository postRepository;

    //    CRUD
    
    public List<PhotoDTO> findAllByPostId (final UUID postId) {
        return photoRepository.findAllByPostId(postId).stream()
                              .map(photo -> mapToDTO(photo, new PhotoDTO()))
                              .collect(Collectors.toList());
    }


    //    MAPPER
    private PhotoDTO mapToDTO (final Photo photo, final PhotoDTO photoDTO) {
        photoDTO.setId(photo.getId());
        photoDTO.setUrl(photo.getUrl());
        photoDTO.setAltText(photo.getAltText());
        photoDTO.setPostId(photo.getPost().getId());
        return photoDTO;
    }

    private Photo mapToEntity (final PhotoDTO photoDTO, final Photo photo) {
        photo.setUrl(photoDTO.getUrl());
        photo.setAltText(photoDTO.getAltText());
        final Post post = photoDTO.getPostId() == null ? null : postRepository.findById(photoDTO.getPostId())
                                                                             .orElseThrow(() -> new NotFoundException(Post.class, "id", photoDTO.getPostId().toString()));
        photo.setPost(post);
        return photo;
    }

}
