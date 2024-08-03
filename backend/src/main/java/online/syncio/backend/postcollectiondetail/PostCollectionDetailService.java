package online.syncio.backend.postcollectiondetail;

import lombok.RequiredArgsConstructor;
import online.syncio.backend.post.PostDTO;
import online.syncio.backend.post.PostMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostCollectionDetailService {

    private final PostCollectionDetailRepository postCollectionDetailRepository;
    private final PostCollectionDetailMapper postCollectionDetailMapper;
    private final PostMapper postMapper;

    public Set<PostDTO> findByCollectionId(final UUID collectionId) {
        final List<PostCollectionDetail> postCollectionDetails = postCollectionDetailRepository.findByPostCollectionIdOrderByCreatedDateDesc(collectionId);
        return postCollectionDetails.stream()
                .map(postCollectionDetail -> postMapper.mapToDTO(postCollectionDetail.getPost(), new PostDTO()))
                .collect(Collectors.toSet());
    }

}
