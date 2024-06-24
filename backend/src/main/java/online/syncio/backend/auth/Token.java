package online.syncio.backend.auth;


import jakarta.persistence.*;
import lombok.*;
import online.syncio.backend.user.User;

import java.time.LocalDateTime;

@Entity
@Table(name = "tokens")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class Token {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "token", length = 1024)
    private String token;

    @Column(name = "refresh_token", length = 255)
    private String refreshToken;

    @Column(name = "token_type", length = 50)
    private String tokenType;

    @Column(name = "expiration_date")
    private LocalDateTime expirationDate;
    // expirationDate is the time when the token expires
    @Column(name = "refresh_expiration_date")
    private LocalDateTime refreshExpirationDate;

    // refreshExpirationDate is the time when the refresh token expires


    private boolean revoked;
    private boolean expired;


    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    public Token(String token, User user, LocalDateTime expirationDate, boolean revoked) {
        this.token = token;
        this.user = user;
        this.expirationDate = expirationDate;
        this.revoked = revoked;
        this.expired = false; // Assume not expired at creation
    }

}