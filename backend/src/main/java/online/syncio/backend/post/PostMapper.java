package online.syncio.backend.post;

import lombok.AllArgsConstructor;
import online.syncio.backend.exception.NotFoundException;
import online.syncio.backend.post.photo.Photo;
import online.syncio.backend.post.photo.PhotoDTO;
import online.syncio.backend.user.User;
import online.syncio.backend.user.UserRepository;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@AllArgsConstructor
public class PostMapper {

    private final UserRepository userRepository;


    public PostDTO mapToDTO (final Post post, final PostDTO postDTO) {
        postDTO.setId(post.getId());
        postDTO.setCaption(post.getCaption());
        postDTO.setAudioURL(post.getAudioURL());

        List<PhotoDTO> photos = post.getPhotos().stream()
                .map(photo -> {
                    PhotoDTO photoDTO = new PhotoDTO();
                    photoDTO.setId(photo.getId());
                    photoDTO.setUrl(photo.getUrl());
                    photoDTO.setAltText(photo.getAltText());
                    photoDTO.setPostId(photo.getPost().getId());
                    return photoDTO;
                })
                .collect(Collectors.toList());
        postDTO.setPhotos(photos);

        postDTO.setCreatedDate(post.getCreatedDate());
        postDTO.setFlag(post.getFlag());
        postDTO.setUsername(post.getCreatedBy().getUsername());
        postDTO.setCreatedBy(post.getCreatedBy().getId());
        postDTO.setVisibility(post.getVisibility());
        return postDTO;
    }


    public Post mapToEntity (final PostDTO postDTO, final Post post) {
        post.setCaption(postDTO.getCaption());
        post.setAudioURL(postDTO.getAudioURL());

        List<Photo> photos = postDTO.getPhotos().stream()
                .map(photoDTO -> {
                    Photo photo = new Photo();
                    photo.setId(photoDTO.getId());
                    photo.setUrl(photoDTO.getUrl());
                    photo.setAltText(photoDTO.getAltText());
                    photo.setPost(post);
                    return photo;
                })
                .collect(Collectors.toList());
        post.setPhotos(photos);

        post.setCreatedDate(postDTO.getCreatedDate());
        post.setFlag(postDTO.getFlag());
        final User user = postDTO.getCreatedBy() == null ? null : userRepository.findById(postDTO.getCreatedBy())
                .orElseThrow(() -> new NotFoundException(User.class, "id", postDTO.getCreatedBy().toString()));
        post.setCreatedBy(user);
        post.setVisibility(postDTO.getVisibility());
        return post;
    }

}
