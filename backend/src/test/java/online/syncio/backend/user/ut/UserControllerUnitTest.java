package online.syncio.backend.user.ut;

import online.syncio.backend.exception.RestExceptionHandler;
import online.syncio.backend.user.*;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.*;

import static org.mockito.Mockito.when;

class UserControllerUnitTest {
    @Mock
    UserService userService;
    @Mock
    UserRedisService userRedisService;
    @Mock
    RestExceptionHandler exceptionHandler;
    @InjectMocks
    UserController userController;

    @BeforeEach
    void setUp () {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testSearchAllUsers () {
        List<UserDTO> expectedDTO = getUserDTOList();
        when(userService.findAll(Optional.of(""))).thenReturn(expectedDTO);
        when(userRedisService.getCachedUsers("")).thenReturn(expectedDTO);

        ResponseEntity<List<UserDTO>> result = userController.searchUsers(Optional.of(""));
        Assertions.assertEquals(ResponseEntity.ok(expectedDTO), result);
    }

    @Test
    void testSearchAllUsers_NoResults () {
        when(userService.findAll(Optional.of(""))).thenReturn(new ArrayList<>());
        when(userRedisService.getCachedUsers("")).thenReturn(new ArrayList<>());

        ResponseEntity<List<UserDTO>> result = userController.searchUsers(Optional.of(""));
        Assertions.assertTrue(result.getBody().isEmpty());
    }

    @Test
    void testSearchUsersByUsername () {
        UserProfile expectedUser = mapToUserProfile(getJohnDoeUser(), new UserProfile());
        when(userService.searchUsers(Optional.of("johndoe"))).thenReturn(List.of(expectedUser));

        ResponseEntity<List<UserProfile>> result = userController.searchUsersByUsername(Optional.of("johndoe"));
        Assertions.assertEquals(ResponseEntity.ok(List.of(expectedUser)), result);
    }

    @Test
    void testSearchUsersByUsername_Fail () {
        UserProfile expectedUser = mapToUserProfile(getJohnDoeUser(), new UserProfile());
        UserProfile unexpectedUser = mapToUserProfile(getHarryPorterUser(), new UserProfile());
        when(userService.searchUsers(Optional.of("johndoe"))).thenReturn(List.of(unexpectedUser));

        ResponseEntity<List<UserProfile>> result = userController.searchUsersByUsername(Optional.of("johndoe"));
        Assertions.assertNotEquals(ResponseEntity.ok(List.of(expectedUser)), result);
    }

    @Test
    void testGetUser () {
        UserDTO expected = getJohnDoeUserDTO();
        when(userService.get(new UUID(2L, 0L))).thenReturn(expected);

        ResponseEntity<UserDTO> result = userController.getUser(new UUID(2L, 0L));
        Assertions.assertEquals(ResponseEntity.ok(expected), result);
    }

    @Test
    void testGetUser_Fail () {
        when(userService.get(new UUID(3L, 0L))).thenReturn(null);

        ResponseEntity<UserDTO> result = userController.getUser(new UUID(3L, 0L));
        Assertions.assertEquals(ResponseEntity.notFound().build(), result);
    }

    @Test
    void testGetUsername () {
        User user = getJohnDoeUser();
        when(userService.getUsernameById(user.getId())).thenReturn(user.getUsername());

        ResponseEntity<Map<String, String>> result = userController.getUsername(user.getId());
        Assertions.assertEquals(ResponseEntity.ok(Collections.singletonMap("username", user.getUsername())), result);
    }

    @Test
    void testGetUsername_Fail () {
        UUID userId = new UUID(3L, 0L);
        when(userService.getUsernameById(userId)).thenReturn(null);

        ResponseEntity<Map<String, String>> result = userController.getUsername(userId);
        Assertions.assertEquals(ResponseEntity.notFound().build(), result);
    }


    public UserDTO mapToDTO (final User user, final UserDTO userDTO) {
        userDTO.setId(user.getId());
        userDTO.setEmail(user.getEmail());
        userDTO.setUsername(user.getUsername());
        userDTO.setPassword(user.getPassword());
        userDTO.setCoverURL(user.getCoverURL());
        userDTO.setBio(user.getBio());
        userDTO.setCreatedDate(user.getCreatedDate());
        userDTO.setRole(user.getRole());
        userDTO.setStatus(user.getStatus());
        return userDTO;
    }

    public UserProfile mapToUserProfile (final User user, final UserProfile userProfile) {
        userProfile.setId(user.getId());
        userProfile.setUsername(user.getUsername());
        userProfile.setBio(user.getBio());
        return userProfile;
    }

    List<User> getUserList () {
        List<User> users = new ArrayList<>();
        users.add(User.builder()
                      .id(new UUID(0L, 0L))
                      .email("syncio@gmail.com")
                      .username("syncio")
                      .coverURL("img.com")
                      .bio("bababoi")
                      .role(RoleEnum.ADMIN)
                      .status(StatusEnum.ACTIVE)
                      .createdDate(LocalDateTime.now())
                      .usernameLastModified(LocalDateTime.now())
                      .build());

        users.add(User.builder()
                      .id(new UUID(1L, 0L))
                      .email("john.doe@example.com")
                      .username("johndoe")
                      .coverURL("image1.com")
                      .bio("John's bio")
                      .role(RoleEnum.USER)
                      .status(StatusEnum.ACTIVE)
                      .createdDate(LocalDateTime.now())
                      .usernameLastModified(LocalDateTime.now())
                      .build());

        users.add(User.builder()
                      .id(new UUID(2L, 0L))
                      .email("jane.smith@example.com")
                      .username("janesmith")
                      .coverURL("image2.com")
                      .bio("Jane's bio")
                      .role(RoleEnum.USER)
                      .status(StatusEnum.ACTIVE)
                      .createdDate(LocalDateTime.now())
                      .usernameLastModified(LocalDateTime.now())
                      .build());

        users.add(User.builder()
                      .id(new UUID(3L, 0L))
                      .email("alice.wonderland@example.com")
                      .username("alicew")
                      .coverURL("image3.com")
                      .bio("Alice's bio")
                      .role(RoleEnum.USER)
                      .status(StatusEnum.ACTIVE)
                      .createdDate(LocalDateTime.now())
                      .usernameLastModified(LocalDateTime.now())
                      .build());

        users.add(User.builder()
                      .id(new UUID(4L, 0L))
                      .email("bob.builder@example.com")
                      .username("bobbuilder")
                      .coverURL("image4.com")
                      .bio("Bob's bio")
                      .role(RoleEnum.USER)
                      .status(StatusEnum.ACTIVE)
                      .createdDate(LocalDateTime.now())
                      .usernameLastModified(LocalDateTime.now())
                      .build());

        users.add(User.builder()
                      .id(new UUID(5L, 0L))
                      .email("charlie.chocolate@example.com")
                      .username("charliec")
                      .coverURL("image5.com")
                      .bio("Charlie's bio")
                      .role(RoleEnum.USER)
                      .status(StatusEnum.ACTIVE)
                      .createdDate(LocalDateTime.now())
                      .usernameLastModified(LocalDateTime.now())
                      .build());

        users.add(User.builder()
                      .id(new UUID(6L, 0L))
                      .email("dave.jones@example.com")
                      .username("davej")
                      .coverURL("image6.com")
                      .bio("Dave's bio")
                      .role(RoleEnum.USER)
                      .status(StatusEnum.ACTIVE)
                      .createdDate(LocalDateTime.now())
                      .usernameLastModified(LocalDateTime.now())
                      .build());

        users.add(User.builder()
                      .id(new UUID(7L, 0L))
                      .email("eve.garden@example.com")
                      .username("eveg")
                      .coverURL("image7.com")
                      .bio("Eve's bio")
                      .role(RoleEnum.USER)
                      .status(StatusEnum.ACTIVE)
                      .createdDate(LocalDateTime.now())
                      .usernameLastModified(LocalDateTime.now())
                      .build());

        users.add(User.builder()
                      .id(new UUID(8L, 0L))
                      .email("frank.stein@example.com")
                      .username("franks")
                      .coverURL("image8.com")
                      .bio("Frank's bio")
                      .role(RoleEnum.USER)
                      .status(StatusEnum.ACTIVE)
                      .createdDate(LocalDateTime.now())
                      .usernameLastModified(LocalDateTime.now())
                      .build());

        users.add(User.builder()
                      .id(new UUID(9L, 0L))
                      .email("gwen.stacy@example.com")
                      .username("gwenstacy")
                      .coverURL("image9.com")
                      .bio("Gwen's bio")
                      .role(RoleEnum.USER)
                      .status(StatusEnum.ACTIVE)
                      .createdDate(LocalDateTime.now())
                      .usernameLastModified(LocalDateTime.now())
                      .build());

        users.add(User.builder()
                      .id(new UUID(10L, 0L))
                      .email("harry.potter@example.com")
                      .username("harryp")
                      .coverURL("image10.com")
                      .bio("Harry's bio")
                      .role(RoleEnum.USER)
                      .status(StatusEnum.ACTIVE)
                      .createdDate(LocalDateTime.now())
                      .usernameLastModified(LocalDateTime.now())
                      .build());

        return users;
    }


    List<UserDTO> getUserDTOList () {
        List<User> userList = getUserList();
        return userList.stream()
                       .map(user -> mapToDTO(user, new UserDTO()))
                       .toList();
    }

    User getHarryPorterUser () {
        return User.builder()
                   .id(new UUID(10L, 0L))
                   .email("harry.potter@example.com")
                   .username("harryp")
                   .coverURL("image10.com")
                   .bio("Harry's bio")
                   .role(RoleEnum.USER)
                   .status(StatusEnum.ACTIVE)
                   .createdDate(LocalDateTime.now())
                   .usernameLastModified(LocalDateTime.now())
                   .build();
    }

    UserDTO getHarryPorterUserDTO () {
        User user = getHarryPorterUser();
        return mapToDTO(user, new UserDTO());
    }

    User getJohnDoeUser () {
        return User.builder()
                   .id(new UUID(1L, 0L))
                   .email("john.doe@example.com")
                   .username("johndoe")
                   .coverURL("image1.com")
                   .bio("John's bio")
                   .role(RoleEnum.USER)
                   .status(StatusEnum.ACTIVE)
                   .createdDate(LocalDateTime.now())
                   .usernameLastModified(LocalDateTime.now())
                   .build();
    }


    UserDTO getJohnDoeUserDTO () {
        User user = getJohnDoeUser();
        return mapToDTO(user, new UserDTO());
    }

}