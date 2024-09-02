package com.ssafy.a410.socket.handler;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.WebSocketHandlerDecorator;

@Component
@Slf4j
public class CustomWebSocketHandlerDecorator extends WebSocketHandlerDecorator {
    private final DisconnectHandler disconnectHandler;

    public CustomWebSocketHandlerDecorator(WebSocketHandler delegate, DisconnectHandler disconnectHandler) {
        super(delegate);
        this.disconnectHandler = disconnectHandler;
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus closeStatus) throws Exception {
        String clientId = session.getPrincipal().getName();
        disconnectHandler.disconnectAll(clientId);
    }
}