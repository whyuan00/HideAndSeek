package com.ssafy.a410.socket.handler;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.handler.WebSocketHandlerDecoratorFactory;

@Component
public class CustomWebSocketHandlerDecoratorFactory implements WebSocketHandlerDecoratorFactory {
    private final DisconnectHandler disconnectHandler;

    public CustomWebSocketHandlerDecoratorFactory(DisconnectHandler disconnectHandler) {
        this.disconnectHandler = disconnectHandler;
    }

    @Override
    public WebSocketHandler decorate(WebSocketHandler handler) {
        return new CustomWebSocketHandlerDecorator(handler, disconnectHandler);
    }
}