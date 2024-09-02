package com.ssafy.a410.socket.config;

import com.ssafy.a410.auth.service.JWTService;
import com.ssafy.a410.auth.service.UserService;
import com.ssafy.a410.socket.handler.CustomWebSocketHandlerDecoratorFactory;
import com.ssafy.a410.socket.handler.DisconnectHandler;
import com.ssafy.a410.socket.interceptor.ConnectionAuthHandshakingInterceptor;
import com.ssafy.a410.socket.interceptor.DispatchingInterceptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.converter.MappingJackson2MessageConverter;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompSessionHandler;
import org.springframework.messaging.simp.stomp.StompSessionHandlerAdapter;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketTransportRegistration;
import org.springframework.web.socket.messaging.WebSocketStompClient;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    @Autowired
    private DispatchingInterceptor dispatchingInterceptor;
    @Autowired
    private JWTService jwtService;
    @Autowired
    private UserService userService;
    @Autowired
    private DisconnectHandler disconnectHandler;

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // WebSocket handshake를 수행할 endpoint를 설정
        registry
                .addEndpoint("/ws")
                .setAllowedOrigins("*")
                .addInterceptors(connectionAuthHandshakingInterceptor());
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // 클라이언트가 WebSocket으로 메시지를 서버에 전송할 때 붙일 접두사
        config.setApplicationDestinationPrefixes("/ws");
        config.enableSimpleBroker("/topic", "/queue");
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(dispatchingInterceptor);
    }

    @Override
    public void configureWebSocketTransport(WebSocketTransportRegistration registration) {
        registration.addDecoratorFactory(new CustomWebSocketHandlerDecoratorFactory(disconnectHandler));
    }

    @Bean
    public WebSocketStompClient webSocketStompClient() {
        WebSocketStompClient stompClient = new WebSocketStompClient(new StandardWebSocketClient());
        stompClient.setMessageConverter(new MappingJackson2MessageConverter());
        return stompClient;
    }

    @Bean
    public StompSessionHandler stompSessionHandler() {
        return new StompSessionHandlerAdapter() {
            // Add necessary overrides for your StompSessionHandlerAdapter
        };
    }

    @Bean
    public ConnectionAuthHandshakingInterceptor connectionAuthHandshakingInterceptor() {
        return new ConnectionAuthHandshakingInterceptor(jwtService, userService);
    }
}
