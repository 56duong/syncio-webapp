package online.syncio.backend.user;

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

    List<User> findTop20ByUsernameContainingOrEmailContaining(String username, String email);

    @Modifying
    @Query("UPDATE User u SET u.status = 'ACTIVE' WHERE u.id = :id")
    void enableUser(UUID id);


    @Query("SELECT u FROM User u LEFT JOIN FETCH u.posts WHERE u.id = :id")
    Optional<User> findByIdWithPosts(@Param("id") UUID id);

    @Query("SELECT u FROM User u JOIN u.stories s WHERE s.createdDate > :createdDate")
    List<User> findAllUsersWithAtLeastOneStoryAfterCreatedDate(LocalDateTime createdDate);

    @Query("SELECT u.username FROM User u WHERE u.id = :id")
    String findUsernameById(UUID id);

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

}
