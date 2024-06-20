package online.syncio.backend.label;

import org.springframework.web.multipart.MultipartFile;

public record LabelUploadRequest(
        MultipartFile file,
        LabelDTO labelDTO
) {

}
