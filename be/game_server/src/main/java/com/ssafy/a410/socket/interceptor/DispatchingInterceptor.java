package com.ssafy.a410.socket.interceptor;

import com.ssafy.a410.socket.controller.dto.SubscriptionTokenResp;
import com.ssafy.a410.socket.handler.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
public class DispatchingInterceptor implements ChannelInterceptor {
    private final List<SocketSubscriptionHandler> socketSubscriptionHandlers;
    private final DisconnectHandler disconnectHandler;

    // 사용자의 구독 요청을 가로채오 적절한 핸들러로 전달하기 위한 Interceptor
    public DispatchingInterceptor(RoomSubscriptionHandler roomSubscriptionHandler, PlayerSubscriptionHandler playerSubscriptionHandler, GameSubscriptionHandler gameSubscriptionHandler, TeamSubscriptionHandler teamSubscriptionHandler, DisconnectHandler disconnectHandler) {
        socketSubscriptionHandlers = List.of(roomSubscriptionHandler, playerSubscriptionHandler, gameSubscriptionHandler, teamSubscriptionHandler);
        this.disconnectHandler = disconnectHandler;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
        StompCommand command = accessor.getCommand();

        if (command == null) {
            return ChannelInterceptor.super.preSend(message, channel);
        } else if (command.equals(StompCommand.SUBSCRIBE)) {
            // 구독할 목적지
            String destination = accessor.getDestination();
            // 구독 토큰
            String token = accessor.getFirstNativeHeader(SubscriptionTokenResp.SUBSCRIPTION_TOKEN_HEADER);
            // 구독 요청한 인증된 클라이언트 ID
            String clientId = accessor.getUser().getName();
            log.debug("클라이언트 {}가 {}를 구독 요청하였습니다.", clientId, destination);

            // 처리되지 않은 경우 구독이 거절됨
            boolean isHandled = findHandlerAndHandle(destination, clientId, token);
            if (!isHandled) {
                return null;
            }
        }

        return ChannelInterceptor.super.preSend(message, channel);
    }

    // 해당 destination을 처리할 수 있는 handler가 있는지 확인한 후, 매치되는 handler가 있으면 반환
    private SocketSubscriptionHandler getMatchedHandler(String destination) {
        return socketSubscriptionHandlers.stream().
                filter(handler -> handler.isTarget(destination))
                .findFirst()
                .orElse(null);
    }

    private boolean findHandlerAndHandle(String destination, String clientId, String token) {
        SocketSubscriptionHandler handler = getMatchedHandler(destination);
        if (handler == null) {
            log.debug("Destination {}를 처리하기 위한 대한 핸들러가 없습니다.", destination);
            return false;
        } else if (!handler.hasPermission(destination, clientId, token)) {
            log.debug("Destination {}에 대한 구독 요청 권한 인증에 실패했습니다(handler: {}).", destination, handler.getClass().getName());
            return false;
        } else {
            log.debug("Destination {}에 대한 구독에 성공했습니다.", destination);
            // 처리할 수 있으면 핸들러에서 적절히 처리 (비동기 권장)
            handler.handle(destination, clientId);
            return true;
        }
    }
}
