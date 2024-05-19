package online.syncio.backend.user;

import online.syncio.backend.comment.Comment;
import online.syncio.backend.comment.CommentRepository;
import online.syncio.backend.exception.NotFoundException;
import online.syncio.backend.exception.ReferencedWarning;
import online.syncio.backend.like.Like;
import online.syncio.backend.like.LikeRepository;
import online.syncio.backend.messagecontent.MessageContent;
import online.syncio.backend.messagecontent.MessageContentRepository;
import online.syncio.backend.messageroommember.MessageRoomMember;
import online.syncio.backend.messageroommember.MessageRoomMemberRepository;
import online.syncio.backend.report.Report;
import online.syncio.backend.report.ReportRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final LikeRepository likeRepository;
    private final CommentRepository commentRepository;
    private final ReportRepository reportRepository;
    private final MessageRoomMemberRepository messageRoomMemberRepository;
    private final MessageContentRepository messageContentRepository;

    public UserService(UserRepository userRepository, LikeRepository likeRepository, CommentRepository commentRepository, ReportRepository reportRepository, MessageRoomMemberRepository messageRoomMemberRepository, MessageContentRepository messageContentRepository) {
        this.userRepository = userRepository;
        this.likeRepository = likeRepository;
        this.commentRepository = commentRepository;
        this.reportRepository = reportRepository;
        this.messageRoomMemberRepository = messageRoomMemberRepository;
        this.messageContentRepository = messageContentRepository;
    }

    

//    CRUD
    public List<UserDTO> findAll() {
        final List<User> users = userRepository.findAll(Sort.by("createdDate").descending());
        return users.stream()
                .map(user -> mapToDTO(user, new UserDTO()))
                .toList();
    }

    public UserDTO get(final UUID id) {
        return userRepository.findById(id)
                .map(user -> mapToDTO(user, new UserDTO()))
                .orElseThrow(() -> new NotFoundException(User.class, "id", id.toString()));
    }

    public UUID create(final UserDTO userDTO) {
        final User user = new User();
        mapToEntity(userDTO, user);
        return userRepository.save(user).getId();
    }

    public void update(final UUID id, final UserDTO userDTO) {
        final User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(User.class, "id", id.toString()));
        mapToEntity(userDTO, user);
        userRepository.save(user);
    }

    public void delete(final UUID id) {
        final User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(User.class, "id", id.toString()));
        userRepository.delete(user);
    }


//    MAPPER
    private UserDTO mapToDTO(final User user, final UserDTO userDTO) {
        userDTO.setId(user.getId());
        userDTO.setEmail(user.getEmail());
        userDTO.setUsername(user.getUsername());
        userDTO.setPassword(user.getPassword());
        userDTO.setAvtURL(user.getAvtURL());
        userDTO.setCoverURL(user.getCoverURL());
        userDTO.setBio(user.getBio());
        userDTO.setCreatedDate(user.getCreatedDate());
        userDTO.setRole(user.getRole());
        userDTO.setStatus(user.getStatus());
        return userDTO;
    }

    private User mapToEntity(final UserDTO userDTO, final User user) {
        user.setEmail(userDTO.getEmail());
        user.setUsername(userDTO.getUsername());
        user.setPassword(userDTO.getPassword());
        user.setAvtURL(userDTO.getAvtURL());
        user.setCoverURL(userDTO.getCoverURL());
        user.setBio(userDTO.getBio());
        user.setCreatedDate(userDTO.getCreatedDate());
        user.setRole(userDTO.getRole());
        user.setStatus(userDTO.getStatus());
        return user;
    }



//    REFERENCED
    public ReferencedWarning getReferencedWarning(final UUID id) {
        final ReferencedWarning referencedWarning = new ReferencedWarning();
        final User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(User.class, "id", id.toString()));

        // Like
        final Like userLike = likeRepository.findFirstByUser(user);
        if (userLike != null) {
            referencedWarning.setKey("user.like.user.referenced");
            referencedWarning.addParam(userLike.getPost().getId());
            return referencedWarning;
        }

        // Comment
        final Comment userComment = commentRepository.findFirstByUser(user);
        if (userComment != null) {
            referencedWarning.setKey("user.comment.user.referenced");
            referencedWarning.addParam(userComment.getPost().getId());
            return referencedWarning;
        }

        // Report
        final Report userReport = reportRepository.findFirstByUser(user);
        if (userReport != null) {
            referencedWarning.setKey("user.report.user.referenced");
            referencedWarning.addParam(userReport.getPost().getId());
            return referencedWarning;
        }

        // MessageRoomMember
        final MessageRoomMember userMessageRoomMember = messageRoomMemberRepository.findFirstByUser(user);
        if (userMessageRoomMember != null) {
            referencedWarning.setKey("user.messageRoomMember.user.referenced");
            referencedWarning.addParam(userMessageRoomMember.getMessageRoom().getId());
            return referencedWarning;
        }

        // MessageContent
        final MessageContent userMessageContent = messageContentRepository.findFirstByUser(user);
        if (userMessageContent != null) {
            referencedWarning.setKey("user.messageContent.user.referenced");
            referencedWarning.addParam(userMessageContent.getMessageRoom().getId());
            return referencedWarning;
        }

        return null;
    }
}
