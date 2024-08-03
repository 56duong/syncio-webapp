package online.syncio.backend.postcollectiondetail;

import lombok.AllArgsConstructor;
import online.syncio.backend.exception.NotFoundException;
import online.syncio.backend.post.Post;
import online.syncio.backend.post.PostRepository;
import online.syncio.backend.postcollection.PostCollection;
import online.syncio.backend.postcollection.PostCollectionRepository;
import org.springframework.stereotype.Component;

@Component
@AllArgsConstructor
public class PostCollectionDetailMapper {

    private final PostRepository postRepository;
    private final PostCollectionRepository postCollectionRepository;


    public PostCollectionDetailDTO mapToDTO (final PostCollectionDetail postCollectionDetail, final PostCollectionDetailDTO postCollectionDetailDTO) {
        postCollectionDetailDTO.setId(postCollectionDetail.getId());
        postCollectionDetailDTO.setCreatedDate(postCollectionDetail.getCreatedDate());
        postCollectionDetailDTO.setPostId(postCollectionDetail.getPost().getId());
        postCollectionDetailDTO.setPostCollectionId(postCollectionDetail.getPostCollection().getId());
        return postCollectionDetailDTO;
    }


    public PostCollectionDetail mapToEntity (final PostCollectionDetailDTO postCollectionDetailDTO, final PostCollectionDetail postCollectionDetail) {
        postCollectionDetail.setCreatedDate(postCollectionDetailDTO.getCreatedDate());
        final Post post = postCollectionDetailDTO.getPostId() == null ? null : postRepository.findById(postCollectionDetailDTO.getPostId())
                .orElseThrow(() -> new NotFoundException(Post.class, "id", postCollectionDetailDTO.getPostId().toString()));
        postCollectionDetail.setPost(post);
        final PostCollection postCollection = postCollectionDetailDTO.getPostCollectionId() == null ? null : postCollectionRepository.findById(postCollectionDetailDTO.getPostCollectionId())
                .orElseThrow(() -> new NotFoundException(PostCollection.class, "id", postCollectionDetailDTO.getPostCollectionId().toString()));
        postCollectionDetail.setPostCollection(postCollection);
        return postCollectionDetail;
    }

}
