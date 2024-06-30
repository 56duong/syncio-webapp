package online.syncio.backend.imagecaption;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class ImageCaptionService {

    @Value("${image-caption-service.url}")
    private String url;

    /**
     * Generate a caption for the given image
     *
     * @param imageURL URL of the image
     * @return CaptionDTO object containing the caption
     */
    public CaptionDTO generateCaption(String imageURL) {
        RestTemplate restTemplate = new RestTemplate();

        // Create the request body
        Map<String, String> requestBody = new HashMap<>();
        requestBody.put("image_url", imageURL.replaceAll("localhost", "host.docker.internal"));

        // Create the headers
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Create the request entity
        HttpEntity<Map<String, String>> requestEntity = new HttpEntity<>(requestBody, headers);

        try {
            // Send the POST request and fetch the response
            ResponseEntity<CaptionDTO> responseEntity = restTemplate.exchange(
                    url + "/generate-caption",
                    HttpMethod.POST,
                    requestEntity,
                    CaptionDTO.class
            );
            // Get the response body
            return responseEntity.getBody();
        } catch (Exception e) {
//            e.printStackTrace();
            return null;
        }
    }

}
