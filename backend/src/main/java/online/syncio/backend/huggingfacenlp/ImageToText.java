package online.syncio.backend.huggingfacenlp;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;

public class ImageToText {

    private final String accessToken;
    private final String inferenceUrl = "https://api-inference.huggingface.co/models/nlpconnect/vit-gpt2-image-captioning";

    public ImageToText(String accessToken) {
        this.accessToken = accessToken;
    }

    public String execute(String photoUrl) throws ExecutionException, InterruptedException, URISyntaxException {
        return fetchAndProcessPhoto(photoUrl).get();
    }

    public CompletableFuture<String> fetchAndProcessPhoto(String photoUrl) throws URISyntaxException {
        URI photoURI = new URI(null, null, photoUrl, null);
        String finalPhotoUrl = photoURI.toASCIIString();
        return CompletableFuture.supplyAsync(() -> {
            try {
                byte[] imageData = HttpUtil.fetchPhoto(finalPhotoUrl);
                return generateText(imageData);
            } catch (Exception e) {
                throw new RuntimeException("Failed to process photo from URL: " + finalPhotoUrl, e);
            }
        });
    }

    public String generateText(byte[] imageData) {
        try {
            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(inferenceUrl))
                    .header("Authorization", "Bearer " + accessToken)
                    .header("Content-Type", "application/octet-stream")
                    .POST(HttpRequest.BodyPublishers.ofByteArray(imageData))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                throw new IOException("Failed to get response from inference API: " + response.body());
            }

            // Parse the response body as a JSON array
            JSONArray jsonArray = new JSONArray(response.body());

            // Assume we only need the first generated text
            JSONObject jsonObject = jsonArray.getJSONObject(0);
            return jsonObject.getString("generated_text");
        } catch (IOException | InterruptedException e) {
            throw new RuntimeException("Error during inference API call", e);
        }
    }

}