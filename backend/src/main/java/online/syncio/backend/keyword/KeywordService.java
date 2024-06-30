package online.syncio.backend.keyword;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class KeywordService {

    @Value("${keyword-service.url}")
    private String url;

    /**
     * Extract keywords from the given text
     *
     * @param text Text from which to extract keywords
     * @return KeywordResponseDTO object containing the extracted keywords
     */
    public KeywordResponseDTO extractKeywords(String text) {
        RestTemplate restTemplate = new RestTemplate();

        // Create the request body
        Map<String, String> requestBody = new HashMap<>();
        requestBody.put("text", text);

        // Create the headers
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Create the request entity
        HttpEntity<Map<String, String>> requestEntity = new HttpEntity<>(requestBody, headers);

        try {
            // Send the POST request and fetch the response
            ResponseEntity<KeywordResponseDTO> responseEntity = restTemplate.exchange(
                    url + "/extract-keywords",
                    HttpMethod.POST,
                    requestEntity,
                    KeywordResponseDTO.class
            );

            // Get the response body
            return responseEntity.getBody();
        } catch (Exception e) {
            return null;
        }

    }

    /**
     * Get the keywords from the KeywordResponseDTO object by order and limit
     * @param keywordResponse
     * @return
     */
    public Set<String> getKeywordsByOrderAndLimit(KeywordResponseDTO keywordResponse) {
        // Limit the number of keywords for each length, sort them by score, and collect the keyword strings
        Set<String> keywordsLength1 = keywordResponse.getKeywordsLength1().stream()
                .sorted(Comparator.comparingDouble(KeywordDTO::getScore))
                .limit(2)
                .map(KeywordDTO::getKeyword)
                .map(String::toLowerCase)
                .collect(Collectors.toSet());

        Set<String> keywordsLength2 = keywordResponse.getKeywordsLength2().stream()
                .sorted(Comparator.comparingDouble(KeywordDTO::getScore))
                .limit(1)
                .map(KeywordDTO::getKeyword)
                .map(String::toLowerCase)
                .collect(Collectors.toSet());

        Set<String> keywordsLength3 = keywordResponse.getKeywordsLength3().stream()
                .sorted(Comparator.comparingDouble(KeywordDTO::getScore))
                .limit(1)
                .map(KeywordDTO::getKeyword)
                .map(String::toLowerCase)
                .collect(Collectors.toSet());

        // Join the keywords with a comma and return
        return Stream.concat(keywordsLength1.stream(), keywordsLength2.stream())
                .collect(Collectors.toSet());
    }

}
