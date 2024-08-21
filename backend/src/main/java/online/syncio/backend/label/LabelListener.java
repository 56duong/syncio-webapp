package online.syncio.backend.label;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;

@AllArgsConstructor
public class LabelListener {
    private final LabelRedisService labelRedisService;

    @PostPersist
    @PostUpdate
    @PostRemove
    public void clearCache(Label label) {
        String labelKey = "label::" + label.getId();
        String labelsKey = "labels";
        String labelsWithPurchaseStatusKey = "labelsWithPurchaseStatus::" + label.getUserLabelInfos();

        labelRedisService.clearByKey(labelKey);
        labelRedisService.clearByKey(labelsKey);
        labelRedisService.clearByKey(labelsWithPurchaseStatusKey);
    }
}
