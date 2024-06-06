package online.syncio.backend.user;


import jakarta.persistence.*;
import lombok.*;
import online.syncio.backend.comment.Comment;
import online.syncio.backend.like.Like;
import online.syncio.backend.messagecontent.MessageContent;
import online.syncio.backend.messageroommember.MessageRoomMember;
import online.syncio.backend.post.Post;
import online.syncio.backend.report.Report;
import online.syncio.backend.story.Story;
import org.hibernate.annotations.GenericGenerator;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.*;

@Entity
@Table(name = "`user`")
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class User implements UserDetails {

    @Id
    @Column(nullable = false, updatable = false)
    @GenericGenerator(name = "uuid", strategy = "org.hibernate.id.UUIDGenerator")
    @GeneratedValue(generator = "uuid")
    private UUID id;

    @Column(nullable = false, unique = true, length = 89)
    private String email;

    @Column(nullable = false, unique = true, length = 30)
    private String username;

    @Column(nullable = false, length = 100)
    private String password;

    @Column(length = 1000)
    private String avtURL;

    @Column(length = 1000)
    private String coverURL;

    @Column
    private String bio;

    @Column
    @CreatedDate
    private LocalDateTime createdDate;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private RoleEnum role;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private StatusEnum status;

    @Column(name = "reset_password_token", length = 30)
    private String resetPasswordToken;

//    @CreatedBy
//    private String createdBy;
//    Post
    @OneToMany(mappedBy = "createdBy")
    private Set<Post> posts;

//    Follow
    @ManyToMany
    @JoinTable(
            name = "user_followers",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "follower_id")
    )
    private Set<User> followers;

    @ManyToMany(mappedBy = "followers")
    private Set<User> following;

//    Like
    @OneToMany(mappedBy = "user")
    private Set<Like> likes;

//    Comment
    @OneToMany(mappedBy = "user")
    private Set<Comment> comments;

//    Report
    @OneToMany(mappedBy = "user")
    private Set<Report> reports;

//    MessageRoomMember
    @OneToMany(mappedBy = "user")
    private Set<MessageRoomMember> messageRoomMembers;

//    MessageContent
    @OneToMany(mappedBy = "user")
    private Set<MessageContent> messageContents;

//    Story
    @OneToMany(mappedBy = "createdBy")
    private Set<Story> stories;

//    View
    @ManyToMany
    @JoinTable(
            name = "user_viewStories",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "viewer_id")
    )
    private Set<User> viewStories;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        List<SimpleGrantedAuthority> authorityList = new ArrayList<>();
        authorityList.add(new SimpleGrantedAuthority("ROLE_" + this.role.name().toUpperCase()));

        return authorityList;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }


}
