package online.syncio.backend.keyword;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Data
public class KeywordResponseDTO {

    @JsonProperty("keywords_length_1")
    private Set<KeywordDTO> keywordsLength1 = new HashSet<>();

    @JsonProperty("keywords_length_2")
    private Set<KeywordDTO> keywordsLength2 = new HashSet<>();

    @JsonProperty("keywords_length_3")
    private Set<KeywordDTO> keywordsLength3 = new HashSet<>();

}
