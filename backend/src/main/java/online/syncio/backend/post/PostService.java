package online.syncio.backend.post;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import online.syncio.backend.auth.responses.RegisterResponse;
import online.syncio.backend.auth.responses.ResponseObject;
import online.syncio.backend.comment.Comment;
import online.syncio.backend.comment.CommentRepository;
import online.syncio.backend.exception.NotFoundException;
import online.syncio.backend.exception.ReferencedWarning;
import online.syncio.backend.like.Like;
import online.syncio.backend.like.LikeRepository;
import online.syncio.backend.report.Report;
import online.syncio.backend.report.ReportRepository;
import online.syncio.backend.user.User;
import online.syncio.backend.user.UserRepository;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostService {
    private static final String UPLOADS_FOLDER = "uploads";
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final LikeRepository likeRepository;
    private final CommentRepository commentRepository;
    private final ReportRepository reportRepository;

    //    CRUD
    public List<PostDTO> findAll () {
        final List<Post> posts = postRepository.findAll(Sort.by("createdDate").descending());
        return posts.stream()
                    .map(post -> mapToDTO(post, new PostDTO()))
                    .toList();
    }

    // load post theo page
    public Page<PostDTO> getPosts (Pageable pageable) {
        // sort theo createdDate giảm dần
        Pageable sortedByCreatedDateDesc = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), Sort.by("createdDate").descending());
        Page<Post> posts = postRepository.findAll(sortedByCreatedDateDesc);

        // map từ entity sang DTO -> trả về List<PostDTO>
        List<PostDTO> postsDTO = posts.stream()
                                      .map(post -> mapToDTO(post, new PostDTO()))
                                      .collect(Collectors.toList());

        // trả về Page<PostDTO>
        return new PageImpl<>(postsDTO, pageable, posts.getTotalElements());
    }


    public PostDTO get (final UUID id) {
        return postRepository.findById(id)
                             .map(post -> mapToDTO(post, new PostDTO()))
                             .orElseThrow(() -> new NotFoundException(Post.class, "id", id.toString()));
    }

    public ResponseEntity<?> create (final CreatePostDTO postDTO) throws IOException {
        User user = userRepository.findById(postDTO.getCreatedBy())
                                  .orElseThrow(() -> new NotFoundException(User.class, "id", postDTO.getCreatedBy().toString()));
        Post post = new Post();

        //Upload image
        List<MultipartFile> files = postDTO.getPhotos();
        List<String> filenames = new ArrayList<>();

        if (files != null && !files.isEmpty()) {
            if (files.size() > 6) {
                return ResponseEntity.badRequest().body("You can upload a maximum of 6 images");
            }

            for (MultipartFile file : files) {
                if (file.getSize() == 0) {
                    continue;
                }
                if (file.getSize() > 10 * 1024 * 1024) {
                    return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                                         .body("File size is too large");
                }
                String contentType = file.getContentType();
                if (contentType == null || !contentType.startsWith("image/")) {
                    return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
                                         .body("File must be an image");
                }

                String filename = storeFile(file);
                filenames.add(filename);
            }
        }

        post.setCaption(postDTO.getCaption());
        post.setFlag(postDTO.getFlag());
        post.setPhotos(filenames);
        post.setCreatedBy(user);

        Post savedPost = postRepository.save(post);
        return ResponseEntity.ok(savedPost.getId());
    }

    private boolean isImageFile (MultipartFile file) {
        String contentType = file.getContentType();
        return contentType != null && contentType.startsWith("image/");
    }

    public String storeFile (MultipartFile file) throws IOException {
        if (!isImageFile(file) || file.getOriginalFilename() == null) {
            throw new IOException("Invalid image format");
        }
        String filename = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        // Thêm UUID vào trước tên file để đảm bảo tên file là duy nhất
        String uniqueFilename = UUID.randomUUID() + "_" + filename;
        // Đường dẫn đến thư mục mà bạn muốn lưu file
        java.nio.file.Path uploadDir = Paths.get(UPLOADS_FOLDER);
        // Kiểm tra và tạo thư mục nếu nó không tồn tại
        if (!Files.exists(uploadDir)) {
            Files.createDirectories(uploadDir);
        }
        // Đường dẫn đầy đủ đến file
        java.nio.file.Path destination = Paths.get(uploadDir.toString(), uniqueFilename);
        // Sao chép file vào thư mục đích
        Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
        return uniqueFilename;
    }

    public void update (final UUID id, final PostDTO postDTO) {
        final Post post = postRepository.findById(id)
                                        .orElseThrow(() -> new NotFoundException(Post.class, "id", id.toString()));
        mapToEntity(postDTO, post);
        postRepository.save(post);
    }

    public void delete (final UUID id) {
        final Post post = postRepository.findById(id)
                                        .orElseThrow(() -> new NotFoundException(Post.class, "id", id.toString()));
        postRepository.delete(post);
    }

    public List<PostDTO> findByUserId (final UUID id) {
        List<Post> posts = postRepository.findByCreatedBy_IdOrderByCreatedDateDesc(id);
        return posts.stream()
                    .map(post -> mapToDTO(post, new PostDTO()))
                    .collect(Collectors.toList());
    }


    //    MAPPER
    private PostDTO mapToDTO (final Post post, final PostDTO postDTO) {
        postDTO.setId(post.getId());
        postDTO.setCaption(post.getCaption());
        postDTO.setPhotos(post.getPhotos());
        postDTO.setCreatedDate(post.getCreatedDate());
        postDTO.setFlag(post.getFlag());
        postDTO.setCreatedBy(post.getCreatedBy().getId());
        return postDTO;
    }

    private Post mapToEntity (final PostDTO postDTO, final Post post) {
        post.setCaption(postDTO.getCaption());
        post.setPhotos(postDTO.getPhotos());
        post.setCreatedDate(postDTO.getCreatedDate());
        post.setFlag(postDTO.getFlag());
        final User user = postDTO.getCreatedBy() == null ? null : userRepository.findById(postDTO.getCreatedBy())
                                                                                .orElseThrow(() -> new NotFoundException(User.class, "id", postDTO.getCreatedBy().toString()));
        post.setCreatedBy(user);
        return post;
    }


    //    REFERENCED
    public ReferencedWarning getReferencedWarning (final UUID id) {
        final ReferencedWarning referencedWarning = new ReferencedWarning();
        final Post post = postRepository.findById(id)
                                        .orElseThrow(() -> new NotFoundException(Post.class, "id", id.toString()));

        // Like
        final Like postLike = likeRepository.findFirstByPost(post);
        if (postLike != null) {
            referencedWarning.setKey("post.like.post.referenced");
            referencedWarning.addParam(postLike.getPost().getId());
            return referencedWarning;
        }

        // Comment
        final Comment postComment = commentRepository.findFirstByPost(post);
        if (postComment != null) {
            referencedWarning.setKey("post.comment.post.referenced");
            referencedWarning.addParam(postComment.getPost().getId());
            return referencedWarning;
        }

        // Report
        final Report postReport = reportRepository.findFirstByPost(post);
        if (postReport != null) {
            referencedWarning.setKey("post.report.post.referenced");
            referencedWarning.addParam(postReport.getPost().getId());
            return referencedWarning;
        }

        return null;
    }

    @Transactional
    public void like (UUID postId, UUID userId) {
        try {
            Post post = postRepository.findById(postId)
                                      .orElseThrow(() -> new NotFoundException(Post.class, "id", postId.toString()));
            User user = userRepository.findById(userId)
                                      .orElseThrow(() -> new NotFoundException(User.class, "id", userId.toString()));

            // Check if the like already exists
            if (post.getLikes().stream().anyMatch(like -> like.getUser().equals(user))) {
                System.out.println("Like already exists.");
                return;
            }

            Like like = new Like();
            like.setPost(post);
            like.setUser(user);
            likeRepository.save(like);


            System.out.println("Like added successfully.");
        } catch (Exception e) {
            System.err.println("Failed to add like: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Transactional
    public ResponseEntity<?> toggleLike (UUID postId, UUID userId) {
        try {
            Post post = postRepository.findById(postId)
                                      .orElseThrow(() -> new NotFoundException(Post.class, "id", postId.toString()));
            User user = userRepository.findById(userId)
                                      .orElseThrow(() -> new NotFoundException(User.class, "id", userId.toString()));

            Optional<Like> existingLike = post.getLikes().stream()
                                              .filter(like -> like.getUser().equals(user))
                                              .findFirst();

            if (existingLike.isPresent()) {
                post.getLikes().remove(existingLike.get());
                likeRepository.delete(existingLike.get());

                return ResponseEntity.ok(ResponseObject.builder()
                                                       .status(HttpStatus.CREATED)
                                                       .data(RegisterResponse.fromUser(user))
                                                       .message("Like removed successfully.")
                                                       .build());
            } else {
                Like newLike = new Like();
                newLike.setPost(post);
                newLike.setUser(user);
                likeRepository.save(newLike);

                return ResponseEntity.ok(ResponseObject.builder()
                                                       .status(HttpStatus.CREATED)
                                                       .data(RegisterResponse.fromUser(user))
                                                       .message("Like added successfully.")
                                                       .build());
            }
        } catch (Exception e) {
            System.err.println("Failed to toggle like: " + e.getMessage());

            return ResponseEntity.badRequest().body(ResponseObject.builder()
                                                                  .status(HttpStatus.BAD_REQUEST)
                                                                  .data(null)
                                                                  .message("Failed to toggle like.")
                                                                  .build());
        }
    }


}
