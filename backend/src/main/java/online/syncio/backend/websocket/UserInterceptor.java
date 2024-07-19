package online.syncio.backend.websocket;

import java.util.ArrayList;
import java.util.Map;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;

/**
 * This class is used to intercept the STOMP messages in the WebSocket connection.
 */
public class UserInterceptor implements ChannelInterceptor {

    /**
     * Used to intercept the CONNECT command in the STOMP protocol.
     * When a client tries to establish a STOMP connection, it sends a CONNECT command. This method intercepts that command,
     * extracts the user's ID from the message headers, and sets it as the authenticated user for the session.
     * <p>
     *  For example:
     *  <blockquote><pre>
     *      this.stompClient.connect({id: userId}, () => {
     *       this.subscription = this.stompClient.subscribe(`/user/queue/newMessageRoom`, (comment: IMessage) => {
     *         this.messageRoomSubject.next(JSON.parse(comment.body));
     *       });
     *     });
     *  </pre></blockquote>
     * @param message
     * @param channel
     * @return
     */
    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        // Get the StompHeaderAccessor from the message
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        // Check if the STOMP command is CONNECT
        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            // Get the native headers from the message
            Object raw = message.getHeaders().get(SimpMessageHeaderAccessor.NATIVE_HEADERS);
            // Check if the native headers is a Map
            if (raw instanceof Map) {
                // Get the 'id' from the native headers
                Object name = ((Map<?, ?>) raw).get("id");
                // Check if the 'id' is an ArrayList
                if (name instanceof ArrayList) {
                    // Set the user for the session using the 'id' from the native headers
                    accessor.setUser(new UserPrincipal(((ArrayList<String>) name).get(0)));
                }
            }
        }
        return message;
    }
}
