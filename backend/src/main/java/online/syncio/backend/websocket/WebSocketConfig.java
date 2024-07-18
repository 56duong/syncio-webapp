package online.syncio.backend.websocket;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    /**
     * Configure the message broker. /topic is the prefix for the topic messages.
     * /app is the prefix for the application messages.
     * @param config
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue");
        config.setApplicationDestinationPrefixes("/app");
        config.setUserDestinationPrefix("/user");
    }

    /**
     * Register the endpoint for the WebSocket connection.
     * /live is the endpoint that the client will connect to.
     * @param registry
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/live")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }

    /**
     * Configure the client inbound channel to intercept the messages.
     * @param registration
     */
    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new UserInterceptor());
    }
}
