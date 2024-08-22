package online.syncio.backend.post;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import online.syncio.backend.exception.AppException;
import online.syncio.backend.exception.NotFoundException;
import online.syncio.backend.huggingfacenlp.HfInference;
import online.syncio.backend.keyword.KeywordResponseDTO;
import online.syncio.backend.keyword.KeywordService;
import online.syncio.backend.post.photo.Photo;
import online.syncio.backend.setting.SettingService;
import online.syncio.backend.user.User;
import online.syncio.backend.user.UserRepository;
import online.syncio.backend.userfollow.UserFollowRepository;
import online.syncio.backend.utils.AuthUtils;
import online.syncio.backend.utils.FileUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostService {
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final KeywordService keywordService;
    private final SettingService settingService;
    private final AuthUtils authUtils;
    private final UserFollowRepository userFollowRepository;
    private final FileUtils fileUtils;
    private final PostMapper postMapper;

    @Value("${firebase.storage.type}")
    private String storageType;


    public List<PostDTO> findAll () {
        final List<Post> posts = postRepository.findAll(Sort.by("createdDate").descending());
        return posts.stream()
                    .map(post -> postMapper.mapToDTO(post, new PostDTO()))
                    .toList();
    }


    // load post theo page
    public Page<PostDTO> getPosts (Pageable pageable) {
        // sort theo createdDate giảm dần
        Pageable sortedByCreatedDateDesc = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), Sort.by("createdDate").descending());
        Page<Post> posts = postRepository.findAll(sortedByCreatedDateDesc);

        // map từ entity sang DTO -> trả về List<PostDTO>
        List<PostDTO> postsDTO = posts.stream()
                .map(post -> postMapper.mapToDTO(post, new PostDTO()))
                .collect(Collectors.toList());

        // trả về Page<PostDTO>
        return new PageImpl<>(postsDTO, pageable, posts.getTotalElements());
    }


    public PostDTO get (final UUID id) {
        final UUID currentUserId = authUtils.getCurrentLoggedInUserId();
        return postRepository.findById(id, currentUserId)
                             .map(post -> postMapper.mapToDTO(post, new PostDTO()))
                             .orElseThrow(() -> new NotFoundException(Post.class, "id", id.toString()));
    }


    /**
     * Create a new post.
     * If the post contains a video, only 1 video is allowed.
     * If the post contains images, maximum 6 images are allowed. It will generate alt text for the images.
     * If the caption is not null, it will extract keywords from the caption and set them for the post.
     * @param createPostDTO
     * @return
     * @throws IOException
     */
    @Transactional
    public PostDTO create (final CreatePostDTO createPostDTO) throws IOException {
        Post post = new Post();
        boolean containsVideo;

        //Upload image
        List<MultipartFile> files = createPostDTO.getFiles();
        List<String> filenames = new ArrayList<>();

        if (files != null && !files.isEmpty()) {
            // check if createPostDTO.getFiles() contain video
            containsVideo = createPostDTO.getFiles().stream().anyMatch(file ->
                    file.getContentType() != null && file.getContentType().startsWith("video/")
            );

            if (containsVideo && files.size() > 1) {
                throw new AppException(HttpStatus.PAYLOAD_TOO_LARGE, "Only 1 video allowed", null);
            }
            else if (files.size() > 6) {
                throw new AppException(HttpStatus.PAYLOAD_TOO_LARGE, "Maximum 6 images allowed", null);
            }

            for (MultipartFile file : files) {
                if (file.getSize() == 0) {
                    continue;
                }
                String filename = containsVideo ? processVideo(file) : processImage(file);
                filenames.add(filename);
            }
        }
        else {
            containsVideo = false;
        }

        // Initialize the Hugging Face Inference object
        HfInference hfInference;
        String token = settingService.getHuggingFaceToken();
        if(token != null) hfInference = new HfInference(token);
        else hfInference = null;

        // Generate and set photos with alt text for the post
        post.setPhotos(filenames.stream()
                .map(filename -> {
                    Photo photo = new Photo();
                    photo.setUrl(filename);
                    photo.setPost(post);

                    if(!containsVideo && hfInference != null) {
                        // Generate alt text for the image
                        String altTexts = null;
                        try {
                            altTexts = hfInference.imageToText(photo.getImageUrl(storageType));
                        } catch (ExecutionException | InterruptedException e) {
                            System.err.println("Error generating alt text: " + e.getMessage());
                            e.printStackTrace();
                        }
                        if (altTexts != null) {
                            photo.setAltText(altTexts);
                        }
                    }

                    return photo;
                })
                .collect(Collectors.toList()));

        // Audio
        if(createPostDTO.getAudio() != null) {
            MultipartFile audio = createPostDTO.getAudio();
            if (audio.getSize() == 0) {
                post.setAudioURL(null);
            } else {
                post.setAudioURL(processAudio(audio));
            }
        }

        // Get keywords from the caption
        Set<String> keywords = new HashSet<>();
        if(createPostDTO.getCaption() != null) {
            KeywordResponseDTO keywordsFromCaption = keywordService.extractKeywords(createPostDTO.getCaption());
            if(keywordsFromCaption != null) {
                keywords = keywordService.getKeywordsByOrderAndLimit(keywordsFromCaption);
            }
        }
        // Set keywords for the post
        if(!keywords.isEmpty()) {
            post.setKeywords(String.join(", ", keywords));
        }

        post.setVisibility(createPostDTO.getVisibility());
        post.setCaption(createPostDTO.getCaption());
        post.setFlag(createPostDTO.getFlag());

        Post savedPost = postRepository.save(post);
        return postMapper.mapToDTO(savedPost, new PostDTO());
    }


    /**
     * Validate and store the image file.
     * Throws an AppException if the file is too large(>10MB) or not an image file.
     * @param image
     * @return
     * @throws IOException
     */
    private String processImage(MultipartFile image) throws IOException {
        if (image.getSize() > 10 * 1024 * 1024) {
            throw new AppException(HttpStatus.PAYLOAD_TOO_LARGE, "File size is too large", null);
        }
        if (image.getContentType() == null || !image.getContentType().startsWith("image/")) {
            throw new AppException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "File must be an image", null);
        }
        return fileUtils.storeFile(image, "posts", false);
    }


    /**
     * Validate and store the video file.
     * Throws an AppException if the file is too large(>100MB) or not an video file.
     * @param video
     * @return video file name. Example: 1234-5678-90ab-cdef.mp4
     * @throws IOException
     */
    private String processVideo(MultipartFile video) throws IOException {
        if (video.getSize() > 100 * 1024 * 1024) {
            throw new AppException(HttpStatus.PAYLOAD_TOO_LARGE, "File size is too large", null);
        }
        if (video.getContentType() == null || !video.getContentType().startsWith("video/")) {
            throw new AppException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "File must be an image", null);
        }
        return fileUtils.storeFile(video, "posts", false);
    }


    /**
     * Validate and store the audio file.
     * Throws an AppException if the file is too large(>10MB) or not an audio file.
     * @param audio
     * @return
     * @throws IOException
     */
    private String processAudio(MultipartFile audio) throws IOException {
        if (audio.getSize() > 10 * 1024 * 1024) {
            throw new AppException(HttpStatus.PAYLOAD_TOO_LARGE, "File size is too large", null);
        }
        if (audio.getContentType() == null || !audio.getContentType().startsWith("audio/")) {
            throw new AppException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "File must be an audio", null);
        }
        return fileUtils.storeFile(audio, "posts", false);
    }


    public void update (final UUID id, final PostDTO postDTO) {
        final Post post = postRepository.findById(id)
                                        .orElseThrow(() -> new NotFoundException(Post.class, "id", id.toString()));
        postMapper.mapToEntity(postDTO, post);
        postRepository.save(post);
    }


    public void delete (final UUID id) {
        final Post post = postRepository.findById(id)
                                        .orElseThrow(() -> new NotFoundException(Post.class, "id", id.toString()));
        postRepository.delete(post);
    }


    public User getCurrentUser() {
        UUID currentUserId = authUtils.getCurrentLoggedInUserId();
        if(currentUserId == null) {
            throw new AppException(HttpStatus.FORBIDDEN, "You must be logged in.", null);
        }
        return userRepository.findById(currentUserId)
                .orElseThrow(() -> new NotFoundException(User.class, "id", currentUserId.toString()));
    }


    public Page<PostDTO> convertToPostDTOPage(Page<Post> posts, Pageable pageable) {
        List<PostDTO> postsDTO = posts.stream()
                .map(post -> postMapper.mapToDTO(post, new PostDTO()))
                .collect(Collectors.toList());
        return new PageImpl<>(postsDTO, pageable, posts.getTotalElements());
    }


    public Page<PostDTO> getPostsFollowing(Pageable pageable) {
        User user = getCurrentUser();
        Set<UUID> following = userFollowRepository.findAllByActorId(user.getId()).stream()
                        .map(userFollow -> userFollow.getTarget().getId())
                        .collect(Collectors.toSet());
        following.add(user.getId()); // Include the current user
        Page<Post> posts = postRepository.findPostsByUserFollowing(pageable, user.getId(), following, LocalDateTime.now().minusDays(1));
        return convertToPostDTOPage(posts, pageable);
    }


    public Page<PostDTO> getPostsInterests(Pageable pageable, Set<UUID> postIds) {
        User user = getCurrentUser();
        if (user.getInterestKeywords() == null) {
            return Page.empty();
        }
        Pageable page = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize());
        Page<Post> posts = getPostsByUserInterests(user, postIds, page);
        return convertToPostDTOPage(posts, pageable);
    }


    public Page<Post> getPostsByUserInterests(User user, Set<UUID> postIds, Pageable pageable) {
        String keywords = Arrays.stream(user.getInterestKeywords().split(", "))
                .map(String::trim)
                .collect(Collectors.joining("|"));
        Set<UUID> following = userFollowRepository.findAllByActorId(user.getId()).stream()
                .map(userFollow -> userFollow.getTarget().getId())
                .collect(Collectors.toSet());
        following.add(user.getId()); // Include the current user
        return postRepository.findPostsByUserInterests(pageable, following, postIds, keywords.isBlank() ? null : keywords);
    }


    public Page<PostDTO> getPostsFeed(Pageable pageable, Set<UUID> postIds) {
        Pageable page = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize());
        Page<Post> posts = postRepository.findPostsFeed(postIds, page);
        return convertToPostDTOPage(posts, pageable);
    }


    public boolean isPostCreatedByUserIFollow(UUID userId) {
        User user = getCurrentUser();
        return userRepository.isFollowing(user.getId(), userId);
    }


    public List<PostDTO> getAllPostsByUserId(UUID userId) {
        final UUID currentUserId = authUtils.getCurrentLoggedInUserId();
        List<Post> posts = postRepository.findAllPostsByUser(userId, currentUserId);
        return posts.stream()
                .map(post -> postMapper.mapToDTO(post, new PostDTO()))
                .collect(Collectors.toList());
    }


    public Page<PostDTO> getPostsByUserId(UUID userId, Pageable pageable) {
        final UUID currentUserId = authUtils.getCurrentLoggedInUserId();
        Page<Post> posts;
        if(currentUserId == null) {
            posts = postRepository.findPostsByVisibilityAndUserId(PostEnum.PUBLIC.toString(), userId, pageable);
        }
        else {
            posts = postRepository.findPostsByUser(userId, currentUserId, pageable);
        }
        return posts.map(post -> postMapper.mapToDTO(post, new PostDTO()));
    }


    @Transactional
    public Optional<Post> blockPost(UUID postId) {
        Optional<Post> postOptional = postRepository.findById(postId);
        postOptional.ifPresent(post -> {
            post.setVisibility(PostEnum.BLOCKED);
            postRepository.save(post);
        });
        return postOptional;
    }


    // get post have report != null and flag = true
    public Page<PostDTO> getPostReported(Pageable pageable) {
        Pageable sortedByCreatedDateDesc = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), Sort.by("createdDate").descending());
        Page<Post> posts = postRepository.findByReportsIsNotNullAndFlagTrue(sortedByCreatedDateDesc);
        List<PostDTO> postsDTO = posts.stream()
                .map(post -> postMapper.mapToDTO(post, new PostDTO()))
                .collect(Collectors.toList());

        return new PageImpl<>(postsDTO, pageable, posts.getTotalElements());
    }


    // get post have report = null and flag = false
    public Page<PostDTO> getPostUnFlagged(Pageable pageable) {
        Pageable sortedByCreatedDateDesc = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), Sort.by("createdDate").descending());
        Page<Post> posts = postRepository.findByReportsIsNotNullAndFlagFalse(sortedByCreatedDateDesc);
        List<PostDTO> postsDTO = posts.stream()
                .map(post -> postMapper.mapToDTO(post, new PostDTO()))
                .collect(Collectors.toList());

        return new PageImpl<>(postsDTO, pageable, posts.getTotalElements());
    }


    // set flag = true for post
    public void setFlag(UUID postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new NotFoundException(Post.class, "id", postId.toString()));
        post.setFlag(false);
        postRepository.save(post);
    }


    // set flag = false for post
    public void setUnFlag(UUID postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new NotFoundException(Post.class, "id", postId.toString()));
        post.setFlag(true);
        postRepository.save(post);
    }

}
