package online.syncio.backend.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    boolean existsByEmail(String email);

    Optional<User>findByEmail(String email);

    Optional<User>findByUsername(String username);

    public User findByResetPasswordToken(String token);

}
