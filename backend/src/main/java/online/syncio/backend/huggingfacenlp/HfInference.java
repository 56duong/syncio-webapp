package online.syncio.backend.huggingfacenlp;

import java.util.concurrent.ExecutionException;

/**
 * Hugging Face Inference class to perform inference on Hugging Face models.
 * Currently, supports image to text.
 * More functionalities can be added in the future.
 */
public class HfInference {
    private final String ACCESS_TOKEN;

    /**
     * Constructs a new HfInference object with the specified access token.
     * @param accessToken the access token used for authentication with the Hugging Face Inference API
     */
    public HfInference(String accessToken) {
        this.ACCESS_TOKEN = accessToken;
    }

    /**
     * Read image from photoUrl and return the text caption of the image.
     * @param photoUrl URL of the image
     * @return Text caption of the image
     */
    public String imageToText(String photoUrl) throws ExecutionException, InterruptedException {
        ImageToText imageToText = new ImageToText(this.ACCESS_TOKEN);
        return imageToText.execute(photoUrl);
    }

    public String summarizeText(String text) {
        return null;
    }

}
