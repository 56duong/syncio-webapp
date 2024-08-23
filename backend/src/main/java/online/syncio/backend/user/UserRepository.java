package online.syncio.backend.user;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    Optional<User>findByEmail(String email);
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    Optional<User>findByUsername(String username);
    List<User> findByUsernameContaining(String username);

    public User findByResetPasswordToken(String token);

    @Query("SELECT u.id, u.username, size(u.followers) " +
            "FROM User u " +
            "WHERE (u.username LIKE %:username% OR u.email LIKE %:email%) " +
            "AND u.role = 'USER' " +
            "AND u.status = 'ACTIVE' " +
            "ORDER BY CASE WHEN u.username = :username THEN 0 WHEN u.email = :email THEN 1 ELSE 2 END, u.username, u.email")
    List<Object[]> findTop20ByUsernameContainingOrEmailContaining(@Param("username") String username, @Param("email") String email, Pageable pageable);

    @Modifying
    @Query("UPDATE User u SET u.status = 'ACTIVE' WHERE u.id = :id")
    void enableUser(UUID id);

    @Modifying
    @Transactional
    @Query("UPDATE User u SET u.qrCodeUrl = :userQRCode WHERE u.id = :id")
    void saveQRCODE(@Param("userQRCode") String userQRCode, @Param("id") UUID id);


    @Query("SELECT u FROM User u LEFT JOIN FETCH u.posts WHERE u.id = :id AND u.status = 'ACTIVE'")
    Optional<User> findByIdWithPosts(@Param("id") UUID id);

    @Query("SELECT u.username FROM User u WHERE u.id = :id")
    String findUsernameById(UUID id);

    @Query("SELECT u.id FROM User u WHERE u.username = :username")
    UUID findUserIdByUsername(String username);

    @Query("SELECT DATE(u.createdDate) as date, COUNT(u) as count " +
            "FROM User u " +
            "WHERE u.createdDate >= :startDate " +
            "GROUP BY DATE(u.createdDate)")
    List<Object[]> countNewUsersSince(@Param("startDate") LocalDateTime startDate);

    @Transactional
    @Modifying
    @Query("UPDATE User u SET u.interestKeywords = :keywords WHERE u.id = :id")
    void updateInterestKeywords(@Param("id") UUID id, @Param("keywords") String keywords);

    @Query("SELECT COUNT(u) > 0 FROM User u JOIN u.following f WHERE u.id = :currentUserId AND f.target.id = :targetUserId")
    boolean isFollowing(@Param("currentUserId") UUID currentUserId, @Param("targetUserId") UUID targetUserId);

    /**
     * Find top :limit users by total interactions in the last N days.
     * Interactions are calculated as follows:
     * - 3 points for each post
     * - 2 points for each comment
     * - 1 point for each like
     * @param startDate Start date for the interactions count
     * @return List of Object[] where Object[0] is the user id and Object[1] is the total interactions
     */
    @Query(value =
            "SELECT u.id, " +
                "       (SELECT COUNT(*) * 3 FROM post p WHERE p.user_id = u.id AND p.created_date >= :startDate) " +
                "       + " +
                "       (SELECT COUNT(*) * 2 FROM comment c WHERE c.user_id = u.id AND c.created_date >= :startDate) " +
                "       + " +
                "       (SELECT COUNT(*) * 1 FROM likes l WHERE l.user_id = u.id AND l.created_date >= :startDate) " +
                "       AS total_interactions " +
                "FROM user u " +
                "HAVING total_interactions >= ( " +
                "    SELECT MIN(total_interactions) " +
                "    FROM ( " +
                "        SELECT " +
                "            (SELECT COUNT(*) * 3 FROM post p WHERE p.user_id = u.id AND p.created_date >= :startDate) " +
                "            + " +
                "            (SELECT COUNT(*) * 2 FROM comment c WHERE c.user_id = u.id AND c.created_date >= :startDate) " +
                "            + " +
                "            (SELECT COUNT(*) * 1 FROM likes l WHERE l.user_id = u.id AND l.created_date >= :startDate) " +
                "            AS total_interactions " +
                "        FROM user u " +
                "        ORDER BY total_interactions DESC " +
                "        LIMIT :limit " +
                "    ) topUsers " +
                ") " +
                "ORDER BY total_interactions DESC",
            nativeQuery = true)
    List<Object[]> findTopUsersByInteractionsInNDays(@Param("startDate") LocalDateTime startDate, @Param("limit") int limit);

    @Query("SELECT u.status FROM User u WHERE u.id = :id")
    Optional<String> findStatusById(UUID id);

}
