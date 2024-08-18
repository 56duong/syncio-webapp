package online.syncio.backend.postcollectiondetail;

import lombok.RequiredArgsConstructor;
import online.syncio.backend.post.PostDTO;
import online.syncio.backend.post.PostMapper;
import online.syncio.backend.utils.AuthUtils;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostCollectionDetailService {

    private final PostCollectionDetailRepository postCollectionDetailRepository;
    private final PostMapper postMapper;
    private final AuthUtils authUtils;

    public List<PostDTO> findByCollectionId(final UUID collectionId) {
        final UUID currentUserId = authUtils.getCurrentLoggedInUserId();
        final List<PostCollectionDetail> postCollectionDetails = postCollectionDetailRepository.findByUserIdAndVisibility(collectionId, currentUserId);
        return postCollectionDetails.stream()
                .map(postCollectionDetail -> postMapper.mapToDTO(postCollectionDetail.getPost(), new PostDTO()))
                .collect(Collectors.toList());
    }

}
