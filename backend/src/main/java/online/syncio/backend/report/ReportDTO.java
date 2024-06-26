package online.syncio.backend.report;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class ReportDTO {

    private UUID postId;

    private UUID userId;

    private LocalDateTime createdDate;

    @NotNull
    private ReasonEnum reason;

    private String description;

}