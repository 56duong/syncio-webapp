package online.syncio.backend.postcollection;

import lombok.AllArgsConstructor;
import online.syncio.backend.exception.NotFoundException;
import online.syncio.backend.user.User;
import online.syncio.backend.user.UserRepository;
import org.springframework.stereotype.Component;

@Component
@AllArgsConstructor
public class PostCollectionMapper {

    private final UserRepository userRepository;


    public PostCollectionDTO mapToDTO (final PostCollection postCollection, final PostCollectionDTO postCollectionDTO) {
        postCollectionDTO.setId(postCollection.getId());
        postCollectionDTO.setName(postCollection.getName());
        postCollectionDTO.setDescription(postCollection.getDescription());
        postCollectionDTO.setCreatedDate(postCollection.getCreatedDate());
        postCollectionDTO.setCreatedById(postCollection.getCreatedBy() == null ? null : postCollection.getCreatedBy().getId());
        postCollectionDTO.setCreatedByUsername(postCollection.getCreatedBy() == null ? null : postCollection.getCreatedBy().getUsername());
        postCollectionDTO.setImageUrl("collections/" + postCollection.getId() + ".jpg");
        return postCollectionDTO;
    }


    public PostCollection mapToEntity (final PostCollectionDTO postCollectionDTO, final PostCollection postCollection) {
        postCollection.setId(postCollectionDTO.getId());
        postCollection.setName(postCollectionDTO.getName());
        postCollection.setDescription(postCollectionDTO.getDescription());
        postCollection.setCreatedDate(postCollectionDTO.getCreatedDate());
        final User user = postCollectionDTO.getCreatedById() == null ? null : userRepository.findById(postCollectionDTO.getCreatedById())
                .orElseThrow(() -> new NotFoundException(User.class, "id", postCollectionDTO.getCreatedById().toString()));
        postCollection.setCreatedBy(user);
        return postCollection;
    }

}
