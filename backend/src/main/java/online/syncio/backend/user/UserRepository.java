package online.syncio.backend.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    boolean existsByEmail(String email);

    Optional<User>findByEmail(String email);

    public User findByResetPasswordToken(String token);

    List<User> findTop20ByUsernameContainingOrEmailContaining(String username, String email);

}
