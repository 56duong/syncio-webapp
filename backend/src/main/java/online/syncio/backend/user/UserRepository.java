package online.syncio.backend.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    boolean existsByEmail(String email);

    Optional<User>findByEmail(String email);

    Optional<User>findByUsername(String username);

    public User findByResetPasswordToken(String token);

    List<User> findTop20ByUsernameContainingOrEmailContaining(String username, String email);

    @Modifying
    @Query("UPDATE User u SET u.status = 'ACTIVE' WHERE u.id = :id")
    void enableUser(UUID id);
}
