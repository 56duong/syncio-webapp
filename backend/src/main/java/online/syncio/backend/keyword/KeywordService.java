package online.syncio.backend.keyword;

import online.syncio.backend.post.Post;
import online.syncio.backend.user.User;
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


    /**
     * Generate a set of keywords based on the user's interest keywords and the post's keywords.
     * If the user already has the maximum number of keywords, the last keyword is removed.
     * @param post
     * @param user
     * @return
     */
    public static Set<String> generateUpdateKeywords(Post post, User user) {
        String[] postKeywords;
        String[] userKeywords;
        LinkedList<String> updatedKeywords = new LinkedList<>();

        // Get the user's interest keywords
        if(user.getInterestKeywords() != null && !user.getInterestKeywords().isBlank()) {
            userKeywords = user.getInterestKeywords().split(", ");
            updatedKeywords = new LinkedList<>(Arrays.asList(userKeywords));
        }

        // Get the post's keywords
        if(post.getKeywords() != null && !post.getKeywords().isBlank()) {
            postKeywords = post.getKeywords().split(", ");

            // Add the post's keywords to the user's keywords
            for (String keyword : postKeywords) {
                // If the user already has the maximum number of keywords, remove the last keyword
                if (updatedKeywords.size() >= 30) {
                    updatedKeywords.removeLast();
                }
                // Add the new keyword at the beginning of the list
                updatedKeywords.addFirst(keyword);
            }
        }

        return new HashSet<>(updatedKeywords);
    }

}
