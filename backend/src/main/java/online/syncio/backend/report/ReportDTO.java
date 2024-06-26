package online.syncio.backend.report;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportDTO {

    private UUID postId;

    private UUID userId;

    private LocalDateTime createdDate;

    @NotNull
    private ReasonEnum reason;

    private String description;


}