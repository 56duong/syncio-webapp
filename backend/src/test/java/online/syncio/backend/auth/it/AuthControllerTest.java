package online.syncio.backend.auth.it;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import online.syncio.backend.auth.TokenRepository;
import online.syncio.backend.auth.request.RegisterDTO;
import online.syncio.backend.auth.request.UserLoginDTO;
import online.syncio.backend.auth.responses.ResponseObject;
import online.syncio.backend.user.StatusEnum;
import online.syncio.backend.user.User;
import online.syncio.backend.user.UserRepository;
import online.syncio.backend.user.UserService;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.http.HttpMethod;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.LinkedHashMap;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.request;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@Testcontainers
class AuthControllerTest {
    @ServiceConnection
    static MySQLContainer<?> mysqlContainer = new MySQLContainer<>("mysql:8.2.0").withReuse(true);
    static String url = "";

    @LocalServerPort
    private static int port;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private TokenRepository tokenRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private MockMvc mockMvc;

    @BeforeAll
    static void beforeAll () {
        mysqlContainer.start();
        url = "http://localhost:" + port + "/api/v1/users";
    }

    @Test
    @Order(1)
    void shouldRegisterSuccessfully () throws Exception {
        String testUrl = url + "/register";
        RegisterDTO newUser = new RegisterDTO();
        newUser.setUsername("newUser");
        newUser.setEmail("newEmail@gmail.com");
        newUser.setPassword("newP@ssword123");
        newUser.setRetypePassword("newP@ssword123");

        MvcResult result = mockMvc.perform(request(HttpMethod.POST, testUrl)
                                                   .content(Objects.requireNonNull(asJsonString(newUser)))
                                                   .accept("application/json")
                                                   .contentType("application/json")
                                          )
                                  .andDo(print())
                                  .andExpect(status().isOk())
                                  .andExpect(jsonPath("$.data.id", notNullValue()))
                                  .andReturn();

        String resultJson = result.getResponse().getContentAsString();
        deleteNewUser(resultJson);
    }

    @Test
    @Order(2)
    void shouldRegisterFailure_Username () throws Exception {
        String testUrl = url + "/register";
        RegisterDTO newUser = new RegisterDTO();
        newUser.setUsername("HarryPorter");
        newUser.setEmail("newEmail@gmail.com");
        newUser.setPassword("newP@ssword123");
        newUser.setRetypePassword("newP@ssword123");

        mockMvc.perform(request(HttpMethod.POST, testUrl)
                                .content(Objects.requireNonNull(asJsonString(newUser)))
                                .accept("application/json")
                                .contentType("application/json")
                       )
               .andDo(print())
               .andExpect(status().isBadRequest())
               .andExpect(jsonPath("$.message").value("Username already exists"));
    }

    @Test
    @Order(3)
    void shouldRegisterFailure_Email () throws Exception {
        String testUrl = url + "/register";
        RegisterDTO newUser = new RegisterDTO();
        newUser.setUsername("newUser");
        newUser.setEmail("harry.porter@gmail.com");
        newUser.setPassword("newP@ssword123");
        newUser.setRetypePassword("newP@ssword123");

        mockMvc.perform(request(HttpMethod.POST, testUrl)
                                .content(Objects.requireNonNull(asJsonString(newUser)))
                                .accept("application/json")
                                .contentType("application/json")
                       )
               .andDo(print())
               .andExpect(status().isBadRequest())
               .andExpect(jsonPath("$.message").value("Email already exists"));
    }

    @Test
    @Order(4)
    void shouldRegisterFailure_Password () throws Exception {
        String testUrl = url + "/register";
        RegisterDTO newUser = new RegisterDTO();
        newUser.setUsername("newUser");
        newUser.setEmail("newemail@gmail.com");
        newUser.setPassword("newP@ssword123");
        newUser.setRetypePassword("newP@ssword456");

        mockMvc.perform(request(HttpMethod.POST, testUrl)
                                .content(Objects.requireNonNull(asJsonString(newUser)))
                                .accept("application/json")
                                .contentType("application/json")
                       )
               .andDo(print())
               .andExpect(status().isBadRequest())
               .andExpect(jsonPath("$.message").value("Password and confirm password do not match"));
    }

    @Test
    @Order(5)
    void shouldLoginSuccessfully () throws Exception {
        RegisterDTO newUser = new RegisterDTO();
        newUser.setUsername("newUser");
        newUser.setEmail("newemail@gmail.com");
        newUser.setPassword("newP@ssword123");
        newUser.setRetypePassword("newP@ssword123");

        String resultJson = addAndActiveAccount(newUser);

        String loginUrl = url + "/login";
        UserLoginDTO userLoginDTO = UserLoginDTO.builder()
                                                .emailOrUsername(newUser.getUsername())
                                                .password(newUser.getPassword())
                                                .build();

        mockMvc.perform(request(HttpMethod.POST, loginUrl)
                                .content(Objects.requireNonNull(asJsonString(userLoginDTO)))
                                .accept("application/json")
                                .contentType("application/json")
                       )
               .andDo(print())
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.data.message").value("Login successfully"));

        deleteNewUser(resultJson);
    }

    @Test
    @Order(6)
    void shouldLoginFailure_Username () throws Exception {
        RegisterDTO newUser = new RegisterDTO();
        newUser.setUsername("newUser");
        newUser.setEmail("newemail@gmail.com");
        newUser.setPassword("newP@ssword123");
        newUser.setRetypePassword("newP@ssword123");

        String resultJson = addAndActiveAccount(newUser);

        String loginUrl = url + "/login";
        UserLoginDTO userLoginDTO = UserLoginDTO.builder()
                                                .emailOrUsername(newUser.getUsername() + "fail")
                                                .password(newUser.getPassword())
                                                .build();

        mockMvc.perform(request(HttpMethod.POST, loginUrl)
                                .content(Objects.requireNonNull(asJsonString(userLoginDTO)))
                                .accept("application/json")
                                .contentType("application/json")
                       )
               .andDo(print())
               .andExpect(status().isNotFound())
               .andExpect(jsonPath("$.message").value("Incorrect email or password"));

        deleteNewUser(resultJson);
    }

    @Test
    @Order(7)
    void shouldLoginFailure_Password () throws Exception {
        RegisterDTO newUser = new RegisterDTO();
        newUser.setUsername("newUser");
        newUser.setEmail("newemail@gmail.com");
        newUser.setPassword("newP@ssword123");
        newUser.setRetypePassword("newP@ssword123");

        String resultJson = addAndActiveAccount(newUser);

        String loginUrl = url + "/login";
        UserLoginDTO userLoginDTO = UserLoginDTO.builder()
                                                .emailOrUsername(newUser.getUsername())
                                                .password(newUser.getPassword() + "123123")
                                                .build();

        mockMvc.perform(request(HttpMethod.POST, loginUrl)
                                .content(Objects.requireNonNull(asJsonString(userLoginDTO)))
                                .accept("application/json")
                                .contentType("application/json")
                       )
               .andDo(print())
               .andExpect(status().isInternalServerError())
               .andExpect(jsonPath("$.message").value("Incorrect email or password"));

        deleteNewUser(resultJson);
    }

    String addAndActiveAccount (RegisterDTO newUser) throws Exception {
        String registerUrl = url + "/register";


        MvcResult result = mockMvc.perform(request(HttpMethod.POST, registerUrl)
                                                   .content(Objects.requireNonNull(asJsonString(newUser)))
                                                   .accept("application/json")
                                                   .contentType("application/json")
                                          )
                                  .andDo(print())
                                  .andExpect(status().isOk())
                                  .andExpect(jsonPath("$.data.id", notNullValue()))
                                  .andReturn();

        String resultJson = result.getResponse().getContentAsString();
        ResponseObject object = objectMapper.readValue(resultJson, new TypeReference<ResponseObject>() {
        });
        LinkedHashMap<String, String> user = (LinkedHashMap<String, String>) object.getData();
        String id = user.get("id");
        Optional<User> updateUser = userRepository.findById(UUID.fromString(id));
        if (updateUser.isPresent()) {
            User u = updateUser.get();
            u.setStatus(StatusEnum.ACTIVE);
            userRepository.save(u);
        }
        return resultJson;
    }

    void deleteNewUser (String json) throws JsonProcessingException {
        if (!json.isEmpty()) {
            ResponseObject object = objectMapper.readValue(json, new TypeReference<ResponseObject>() {
            });
            LinkedHashMap<String, String> user = (LinkedHashMap<String, String>) object.getData();
            if (!user.get("id").isBlank()) {
                UUID userId = UUID.fromString(user.get("id"));
                tokenRepository.deleteAll();
                userRepository.deleteById(userId);
            }
        }
    }


    private String asJsonString (Object object) {
        try {
            return new ObjectMapper().writeValueAsString(object);
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }
        return null;
    }
}
