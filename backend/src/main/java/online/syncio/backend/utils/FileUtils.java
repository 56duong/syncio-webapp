package online.syncio.backend.utils;

import lombok.RequiredArgsConstructor;
import online.syncio.backend.firebase.FirebaseStorageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@RequiredArgsConstructor
@Component
public class FileUtils {
    private final FirebaseStorageService firebaseStorageService = new FirebaseStorageService();

    private final String UPLOADS_FOLDER = "uploads";
    private final String FILE_IMAGE_EXTENSION = "jpg";
    private final String FILE_AUDIO_EXTENSION = "mp4";

    @Value("${firebase.storage.type}")
    private String storageType;


    /**
     * Will store the file to the local storage or firebase storage based on the storage type.
     * @param file
     * @param folderName
     * @return If the storage type is firebase, it will return the file path. Example: fileName.fileExtension
     * @throws IOException If the file is empty or the file name is null.
     */
    public String storeFile(MultipartFile file, String folderName, boolean isKeepCurrentName) throws IOException {
        if (file.isEmpty()) {
            throw new IOException("Failed to store empty file " + file.getOriginalFilename());
        }
        if (file.getOriginalFilename() == null) {
            throw new IOException("Failed to store file with null name");
        }

        if (storageType.equals("firebase")) {
            return storeFileToFirebase(file, folderName, isKeepCurrentName);
        }
        else {
            return storeFileToLocal(file, folderName, isKeepCurrentName);
        }
    }


    private String storeFileToFirebase(MultipartFile file, String folderName, boolean isKeepCurrentName) {
        if(isKeepCurrentName) {
            return firebaseStorageService.uploadFileKeepCurrentName(file, folderName);
        }
        else {
            boolean isImage = file.getContentType().startsWith("image");
            return firebaseStorageService.uploadFile(file, folderName, isImage ? FILE_IMAGE_EXTENSION : FILE_AUDIO_EXTENSION);
        }
    }


    private String storeFileToLocal(MultipartFile file, String folderName, boolean isKeepCurrentName) throws IOException {
        //check if file is image
        boolean isImage = file.getContentType().startsWith("image");

        String newFileName = file.getOriginalFilename();
        if (isImage) {
            // generate new file name with default extension
            if (!isKeepCurrentName) {
                newFileName = UUID.randomUUID() + "." + FILE_IMAGE_EXTENSION;
            }
        }
        else {
            // if file is not image, get the file extension and generate new file name with the extension
            String fileExtension = file.getOriginalFilename().substring(file.getOriginalFilename().lastIndexOf(".") + 1);
            newFileName = UUID.randomUUID() + "." + fileExtension;
        }
        Path path = Paths.get(UPLOADS_FOLDER, folderName);
        if (!Files.exists(path)) {
            Files.createDirectories(path);
        }
        Path destination = Paths.get(path.toString(), newFileName);
        Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
        return newFileName;
    }

}
