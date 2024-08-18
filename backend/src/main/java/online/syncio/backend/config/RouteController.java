package online.syncio.backend.config;

import online.syncio.backend.auth.responses.ResponseObject;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RouteController {
    /**
     * For Android and Windows, this is used to check if the server is running.
     * @return "Welcome to Syncio" message
     */
    @RequestMapping(value = "${api.prefix}/welcome-page")
    public ResponseEntity<ResponseObject> index() {
        System.out.println("Welcome to Syncio");
        return ResponseEntity.ok().body(
                ResponseObject.builder()
                    .message("Welcome to Syncio")
                    .status(HttpStatus.OK)
                    .build());
    }

}
