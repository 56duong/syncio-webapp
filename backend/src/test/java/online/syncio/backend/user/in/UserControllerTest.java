package online.syncio.backend.user.in;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.http.HttpMethod;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@Testcontainers
class UserControllerTest {
    @ServiceConnection
    static MySQLContainer<?> mysqlContainer = new MySQLContainer<>("mysql:8.2.0").withReuse(true);
    static String url = "";

    @LocalServerPort
    private static int port;

    @Autowired
    private MockMvc mockMvc;

    @BeforeAll
    static void beforeAll () {
        mysqlContainer.start();
        url = "http://localhost:" + port + "/api/v1/users";
    }

    @Test
    void shouldGetAllUsers () throws Exception {
        mockMvc.perform(MockMvcRequestBuilders
                                .request(HttpMethod.GET, url)
                                .accept("application/json")
                                .contentType("application/json")
                       )
               .andDo(print())
               .andExpect(status().isOk())
               .andExpect(jsonPath("$", hasSize(45)));
    }

    @Test
    void shouldGet20Users () throws Exception {
        String testUrl = url + "/search";
        mockMvc.perform(MockMvcRequestBuilders
                                .request(HttpMethod.GET, testUrl)
                                .param("username", "")
                                .param("email", "")
                                .accept("application/json")
                                .contentType("application/json")
                       )
               .andDo(print())
               .andExpect(status().isOk())
               .andExpect(jsonPath("$", hasSize(20)));
    }

    @Test
    void shouldGet1UserByUsername () throws Exception {
        String testUrl = url + "/search";
        mockMvc.perform(MockMvcRequestBuilders
                                .request(HttpMethod.GET, testUrl)
                                .param("username", "HarryPorter")
                                .accept("application/json")
                                .contentType("application/json")
                       )
               .andDo(print())
               .andExpect(status().isOk())
               .andExpect(jsonPath("$", hasSize(1)));
    }

    @Test
    void shouldGet8UserContainsUsername () throws Exception {
        String testUrl = url + "/search";
        mockMvc.perform(MockMvcRequestBuilders
                                .request(HttpMethod.GET, testUrl)
                                .param("username", "man")
                                .accept("application/json")
                                .contentType("application/json")
                       )
               .andDo(print())
               .andExpect(status().isOk())
               .andExpect(jsonPath("$", hasSize(8)));
    }

    @Test
    void shouldGet1UserProfileById () throws Exception {
        String testUrl = url + "/9dbe1c42-a5bb-4dbe-b909-9b4167ceb12b";
        mockMvc.perform(MockMvcRequestBuilders
                                .request(HttpMethod.GET, testUrl)
                                .accept("application/json")
                                .contentType("application/json")
                       )
               .andDo(print())
               .andExpect(status().isOk())
               .andExpect(jsonPath("$", hasSize(1)));
    }

    @Test
    void shouldReturnNotFoundForInvalidUserId () throws Exception {
        String testUrl = url + "/9dbe1c42-0000-4dbe-000-00000ceb12b";
        mockMvc.perform(MockMvcRequestBuilders
                                .request(HttpMethod.GET, testUrl)
                                .accept("application/json")
                                .contentType("application/json")
                       )
               .andDo(print())
               .andExpect(status().isNotFound());
    }

    @Test
    void shouldReturnBadRequestForMalformedUuid () throws Exception {
        String testUrl = url + "/1234";
        mockMvc.perform(MockMvcRequestBuilders
                                .request(HttpMethod.GET, testUrl)
                                .accept("application/json")
                                .contentType("application/json")
                       )
               .andDo(print())
               .andExpect(status().isBadRequest());
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
