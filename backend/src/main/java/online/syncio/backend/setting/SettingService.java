package online.syncio.backend.setting;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Transactional
public class SettingService {
    @Autowired
    SettingRepository settingRepo;

    public EmailSettingBag getEmailSettings() {
        try {
            List<Setting> settings = settingRepo.findByCategory(SettingCategory.MAIL_SERVER);
            settings.addAll(settingRepo.findByCategory(SettingCategory.MAIL_TEMPLATES));
            return new EmailSettingBag(settings);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error retrieving email settings", e);
        }
    }

    public String getHuggingFaceToken() {
        Setting setting = settingRepo.findBySettingKey("HUGGING_FACE_TOKEN");
        if (setting == null) {
            return null;
        }
        return setting.getSettingValue();
    }
}