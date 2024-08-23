package online.syncio.backend.postcollection;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import online.syncio.backend.exception.AppException;
import online.syncio.backend.exception.NotFoundException;
import online.syncio.backend.post.Post;
import online.syncio.backend.post.PostRepository;
import online.syncio.backend.postcollectiondetail.PostCollectionDetail;
import online.syncio.backend.postcollectiondetail.PostCollectionDetailRepository;
import online.syncio.backend.stickergroup.StickerGroup;
import online.syncio.backend.utils.AuthUtils;
import online.syncio.backend.utils.FileUtils;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostCollectionService {

    private final PostCollectionRepository postCollectionRepository;
    private final PostCollectionMapper postCollectionMapper;
    private final PostRepository postRepository;
    private final PostCollectionDetailRepository postCollectionDetailRepository;
    private final FileUtils fileUtils;
    private final AuthUtils authUtils;


    public Set<PostCollectionDTO> findAll () {
        final List<PostCollection> posts = postCollectionRepository.findAll(Sort.by("createdDate").descending());
        return posts.stream()
                    .map(postCollection -> postCollectionMapper.mapToDTO(postCollection, new PostCollectionDTO()))
                    .collect(Collectors.toSet());
    }


    public UUID create(final PostCollectionDTO postCollectionDTO) {
        final PostCollection postCollection = new PostCollection();
        postCollectionMapper.mapToEntity(postCollectionDTO, postCollection);
        return postCollectionRepository.save(postCollection).getId();
    }


    @Transactional
    public String uploadPhoto(final MultipartFile photo) {
        try {
            String folder = "collections";
            String filePath = fileUtils.storeFile(photo, folder, false);
            String fileName = filePath.replace(folder + "/", "");
            int lastIndexOfDot = fileName.lastIndexOf(".");
            if (lastIndexOfDot != -1) {
                return fileName.substring(0, lastIndexOfDot);
            }
        } catch (IOException e) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Could not save photo: " + photo.getOriginalFilename(), e);
        }
        return null;
    }


    public PostCollectionDTO findById(final UUID id) {
        return postCollectionRepository.findByIdAndCreatedByIsActive(id)
                .map(postCollection -> postCollectionMapper.mapToDTO(postCollection, new PostCollectionDTO()))
                .orElseThrow(() -> new NotFoundException(PostCollection.class, "id", id.toString()));
    }


    public List<PostCollectionDTO> findByCreatedById(final UUID userId) {
        final List<PostCollection> posts = postCollectionRepository.findByCreatedByIdAndCreatedByIsActiveOrderByCreatedDateDesc(userId);
        return posts.stream()
                    .map(postCollection -> postCollectionMapper.mapToDTO(postCollection, new PostCollectionDTO()))
                    .collect(Collectors.toList());
    }


    public UUID saveToCollections(final UUID postId, final List<UUID> collectionIds) {
        final Post post = postRepository.findById(postId)
                .orElseThrow(() -> new NotFoundException(Post.class, "id", postId.toString()));

        // check if the current user is the creator of the post
        final UUID currentUserId = authUtils.getCurrentLoggedInUserId();
        if (!post.getCreatedBy().getId().equals(currentUserId)) {
            throw new AppException(HttpStatus.UNAUTHORIZED, "User not authorized to modify this post", null);
        }

        // For the remaining PostCollectionDetail entities, check if they are already in the database. If not, create new ones.
        final List<PostCollection> collections = postCollectionRepository.findAllById(collectionIds);

        // check if the current user is the creator of the collections
        for (PostCollection collection : collections) {
            if (!collection.getCreatedBy().getId().equals(currentUserId)) {
                throw new AppException(HttpStatus.UNAUTHORIZED, "User not authorized to modify this collection", null);
            }
        }

        // Fetch all PostCollectionDetail entities for the given postId
        List<PostCollectionDetail> existingPostCollectionDetails = postCollectionDetailRepository.findByPostId(postId);

        // Filter out those that are not in the provided collectionIds and delete them
        List<PostCollectionDetail> postCollectionDetailsToDelete = existingPostCollectionDetails.stream()
                .filter(postCollectionDetail -> !collectionIds.contains(postCollectionDetail.getPostCollection().getId()))
                .collect(Collectors.toList());
        postCollectionDetailRepository.deleteAll(postCollectionDetailsToDelete);

        Set<PostCollectionDetail> postCollectionDetailsToSave = collections.stream()
                .map(collection -> {
                    final PostCollectionDetail postCollectionDetail = existingPostCollectionDetails.stream()
                            .filter(detail -> detail.getPostCollection().getId().equals(collection.getId()))
                            .findFirst()
                            .orElse(new PostCollectionDetail());
                    postCollectionDetail.setPost(post);
                    postCollectionDetail.setPostCollection(collection);
                    return postCollectionDetail;
                })
                .collect(Collectors.toSet());
        postCollectionDetailRepository.saveAll(postCollectionDetailsToSave);

        return postId;
    }


    public Set<PostCollectionDTO> findByPostIdAndCreatedById(final UUID postId, final UUID userId) {
        final List<PostCollection> postCollections = postCollectionRepository.findByPostIdAndCreatedById(postId, userId);
        return postCollections.stream()
                .map(postCollection -> postCollectionMapper.mapToDTO(postCollection, new PostCollectionDTO()))
                .collect(Collectors.toSet());
    }


    public boolean deleteImage(final UUID id) {
        // Check if the collection exists
        final Optional<PostCollection> collection = postCollectionRepository.findById(id);
        if (collection.isEmpty()) {
            throw new AppException(HttpStatus.BAD_REQUEST, "User setting not found", null);
        }
        else {
            // check if the current user is the creator of the collection
            final UUID currentUserId = authUtils.getCurrentLoggedInUserId();
            if (!collection.get().getCreatedBy().getId().equals(currentUserId)) {
                throw new AppException(HttpStatus.UNAUTHORIZED, "User not authorized to modify this collection", null);
            }
        }

        // Delete the file
        try {
            boolean isDeleted = fileUtils.deleteFile("collections/" + collection.get().getId() + ".jpg");
            if(isDeleted) {
                return true;
            }
            else {
                throw new AppException(HttpStatus.BAD_REQUEST, "Could not delete file", null);
            }
        } catch (IOException e) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Could not delete file", e);
        }
    }


    public String updateImage(MultipartFile photo, UUID createdById) {
        // check if the current user is the creator of the collection
        final UUID currentUserId = authUtils.getCurrentLoggedInUserId();
        if (!createdById.equals(currentUserId)) {
            throw new AppException(HttpStatus.UNAUTHORIZED, "User not authorized to modify this collection", null);
        }

        try {
            return fileUtils.storeFile(photo, "collections", true);
        } catch (IOException e) {
            throw new AppException(HttpStatus.BAD_REQUEST, "Could not update image", e);
        }
    }


    public void update(final UUID createdById, final PostCollectionDTO postCollectionDTO) {
        final UUID currentUserId = authUtils.getCurrentLoggedInUserId();
        if (currentUserId == null) {
            throw new AppException(HttpStatus.UNAUTHORIZED, "User not logged in", null);
        }
        else {
            // check if the current user is the creator of the collection
            if (!createdById.equals(currentUserId)) {
                throw new AppException(HttpStatus.UNAUTHORIZED, "User not authorized to modify this collection", null);
            }
            postCollectionDTO.setCreatedById(currentUserId);
        }
        final PostCollection postCollection = postCollectionRepository.findById(postCollectionDTO.getId())
                .orElseThrow(() -> new NotFoundException(PostCollection.class, "id", createdById.toString()));
        postCollectionMapper.mapToEntity(postCollectionDTO, postCollection);
        postCollectionRepository.save(postCollection);
    }

}
