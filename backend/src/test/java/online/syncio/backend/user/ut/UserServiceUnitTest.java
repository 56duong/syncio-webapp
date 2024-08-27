package online.syncio.backend.user.ut;

import online.syncio.backend.exception.NotFoundException;
import online.syncio.backend.user.*;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.any;
import static org.mockito.Mockito.when;

class UserServiceUnitTest {
    @Mock
    UserRepository userRepository;
    @Mock
    UserMapper userMapper;
    @InjectMocks
    UserService userService;

    @BeforeEach
    void setUp () {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testFindAll () {
        List<User> users = getUserList();
        List<UserDTO> expected = getUserDTOList();

        when(userRepository.findByUsernameContaining("")).thenReturn(users);

        List<UserDTO> result = userService.findAll(Optional.of(""));
        Assertions.assertEquals(expected.size(), result.size());
    }


    @Test
    void testFindAll_Fail () {
        List<User> users = getUserList();
        List<UserDTO> notExpected = new ArrayList<>();

        when(userRepository.findByUsernameContaining("")).thenReturn(users);

        List<UserDTO> result = userService.findAll(Optional.of(""));
        Assertions.assertNotEquals(notExpected, result);
    }

    @Test
    void testFindAll_NoUsers () {
        when(userRepository.findByUsernameContaining("")).thenReturn(new ArrayList<>());

        List<UserDTO> result = userService.findAll(Optional.of(""));
        Assertions.assertTrue(result.isEmpty());
    }

    @Test
    void testSearchUsers () {
        User johnDoeUser = getJohnDoeUser();
        UserProfile johnProfile = mapToUserProfile(johnDoeUser, new UserProfile());
        List<User> users = new ArrayList<>();
        users.add(johnDoeUser);

        when(userRepository.findByUsernameContaining("johndoe")).thenReturn(users);
        when(userMapper.mapToUserProfile(johnDoeUser, new UserProfile())).thenReturn(johnProfile);

        List<UserProfile> result = userService.searchUsers(Optional.of("johndoe"));
        Assertions.assertEquals(johnProfile, result.get(0));
    }

    @Test
    void testSearchUsers_Fail () {
        User expectedUser = getJohnDoeUser();
        UserProfile expectedProfile = mapToUserProfile(expectedUser, new UserProfile());
        List<User> users = new ArrayList<>();
        users.add(expectedUser);
        User unexpectedUser = getHarryPorterUser();
        UserProfile unexpectedProfile = mapToUserProfile(unexpectedUser, new UserProfile());

        when(userRepository.findByUsernameContaining("johndoe")).thenReturn(users);
        when(userMapper.mapToUserProfile(expectedUser, new UserProfile())).thenReturn(expectedProfile);

        List<UserProfile> result = userService.searchUsers(Optional.of("johndoe"));
        Assertions.assertNotEquals(unexpectedProfile, result.get(0));
    }

    @Test
    void testSearchUsers_NoMatch () {
        when(userRepository.findByUsernameContaining("nonexistent")).thenReturn(new ArrayList<>());

        List<UserProfile> result = userService.searchUsers(Optional.of("nonexistent"));
        Assertions.assertTrue(result.isEmpty());
    }

    @Test
    void testGet_Fail () {
        when(userRepository.findById(any(UUID.class))).thenReturn(Optional.empty());
        assertThrows(NotFoundException.class, () -> {
            userService.get(new UUID(0L, 0L));
        });
    }

    @Test
    void testGetUserProfile () {
        when(userRepository.findByIdWithPosts(any(UUID.class))).thenReturn(Optional.of(new User()));
        when(userMapper.mapToUserProfile(any(User.class), any(UserProfile.class))).thenReturn(new UserProfile());

        UserProfile result = userService.getUserProfile(new UUID(0L, 0L));
        Assertions.assertEquals(new UserProfile(), result);
    }

    @Test
    void testGetUserProfile_Fail () {
        when(userRepository.findByIdWithPosts(any(UUID.class))).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> {
            userService.getUserProfile(new UUID(0L, 0L));
        });
    }

    @Test
    void testGetUsernameById () {
        when(userRepository.findUsernameById(new UUID(0L, 0L))).thenReturn("a user was retrieved!");

        String result = userService.getUsernameById(new UUID(0L, 0L));
        Assertions.assertEquals("a user was retrieved!", result);
    }

    @Test
    void testGetUsernameById_Fail () {
        when(userRepository.findUsernameById(any(UUID.class))).thenReturn(null);

        String result = userService.getUsernameById(new UUID(0L, 0L));
        Assertions.assertNull(result);
    }

    @Test
    void testGetUserByUsername () {
        User returnedUser = getJohnDoeUser();
        UserDTO returnedDTO = mapToDTO(returnedUser, new UserDTO());

        when(userRepository.findByUsername("johndoe")).thenReturn(Optional.of(returnedUser));
        when(userMapper.mapToDTO(returnedUser, new UserDTO())).thenReturn(returnedDTO);

        UserDTO result = userService.getUserByUsername("johndoe");
        Assertions.assertEquals(returnedDTO, result);
    }

    @Test
    void testGetUserByUsername_Fail () {
        when(userRepository.findByUsername("nonexistent")).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> {
            userService.getUserByUsername("nonexistent");
        });
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