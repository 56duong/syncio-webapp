package online.syncio.backend.config;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.type.TypeFactory;
import online.syncio.backend.post.PostDTO;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.io.IOException;
import java.util.List;

public class PageImplJsonDeserializer extends JsonDeserializer<PageImpl<?>> {
    @Override
    public PageImpl<?> deserialize(JsonParser jp, DeserializationContext ctxt) throws IOException, JsonProcessingException {
        ObjectMapper mapper = (ObjectMapper) jp.getCodec();
        JsonNode node = jp.getCodec().readTree(jp);
        JsonNode contentNode = node.get("content");
        int page = node.get("number").asInt();
        int size = node.get("size").asInt();
        long totalElements = node.get("totalElements").asLong();
        List<?> content = mapper.readValue(contentNode.toString(), TypeFactory.defaultInstance().constructCollectionType(List.class, PostDTO.class));
        return new PageImpl<>(content, PageRequest.of(page, size), totalElements);
    }
}