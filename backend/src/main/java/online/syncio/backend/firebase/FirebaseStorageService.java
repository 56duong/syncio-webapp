package online.syncio.backend.firebase;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.cloud.StorageClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

@Service
public class FirebaseStorageService {

    @Value("${firebase.storage.type}")
    private String storageType;

    @Value("${firebase.storage.bucket.url}")
    private String bucketName;

    @Value("${firebase.service.account.key.path}")
    private String serviceAccount;


    @PostConstruct
    public void init() {
        if(!this.storageType.equals("firebase")) {
            return;
        }
        try {
            InputStream serviceAccountStream = new ClassPathResource(this.serviceAccount).getInputStream();

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccountStream))
                    .setStorageBucket(this.bucketName)
                    .build();

            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }


    /**
     * Upload file to firebase storage.
     * @param multipartFile file to upload
     * @param folderName folder name to store file
     * @param fileType file type. e.g. jpg, png, mp4
     * @return file path. e.g. fileName
     */
    public String uploadFile(MultipartFile multipartFile, String folderName, String fileType) {
        try {
            String fileName = UUID.randomUUID() + "." + fileType;
            Path tempFile = Files.createTempFile(fileName, "");
            multipartFile.transferTo(tempFile.toFile());

            String fullPath = folderName + "/" + fileName;
            StorageClient.getInstance().bucket().create(fullPath, Files.readAllBytes(tempFile), multipartFile.getContentType()).getMediaLink();
            return fileName;
        } catch (IOException e) {
            e.printStackTrace();
        }
        return null;
    }


    public String uploadFileKeepCurrentName(MultipartFile multipartFile, String folderName) {
        try {
            String fileName = multipartFile.getOriginalFilename();
            Path tempFile = Files.createTempFile(fileName, "");
            multipartFile.transferTo(tempFile.toFile());

            String fullPath = folderName + "/" + fileName;
            StorageClient.getInstance().bucket().create(fullPath, Files.readAllBytes(tempFile), multipartFile.getContentType()).getMediaLink();
            return fileName;
        } catch (IOException e) {
            e.printStackTrace();
        }
        return null;
    }


    public boolean deleteFile(String fileName) {
        try {
            StorageClient.getInstance().bucket().get(fileName).delete();
            return true;
        } catch (Exception e) {
            e.printStackTrace();
        }
        return false;
    }

}