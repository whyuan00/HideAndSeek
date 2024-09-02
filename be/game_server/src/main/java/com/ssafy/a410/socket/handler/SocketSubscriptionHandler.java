package com.ssafy.a410.socket.handler;

import com.ssafy.a410.socket.domain.Subscribable;
import org.springframework.stereotype.Component;

/**
 * Websocket 클라이언트의 특정 destination 구독에 대한 authorization을 수행하는 핸들러 인터페이스
 */
@Component
public abstract class SocketSubscriptionHandler {
    protected abstract String getDestinationPattern();

    // destination이 해당 핸들러의 처리 대상인지 확인한다.
    public boolean isTarget(String destination) {
        return destination.matches(getDestinationPattern());
    }

    // destination을 사용하여 구독 가능한 객체를 찾아낸다.
    protected abstract Subscribable getSubscribableFrom(String destination);

    // 구독 가능한 객체의 토큰과 사용자가 제공한 토큰이 일치하는지 확인한다.
    public final boolean hasValidToken(Subscribable subscribable, String token) {
        return subscribable != null && subscribable.getSubscriptionToken().equals(token);
    }

    // destination에 대한 clientId와 token을 사용하여 사용자가 해당 destination에 대한 권한을 가지고 있는지 확인한다.
    public final boolean hasPermission(String destination, String clientId, String token) {
        // 구독 객체를 찾을 수 없으면 권한이 없음
        Subscribable subscribable = getSubscribableFrom(destination);
        if (subscribable == null) {
            return false;
        }

        // 토큰 자체가 유효하지 않으면 권한이 없음
        if (!hasValidToken(subscribable, token)) {
            return false;
        }

        // 모두 통과한 경우 기타 구독 대상에 대한 권한 검사를 수행한다.
        return isClientHasPermission(subscribable, clientId);
    }

    // destination에 대한 clientId가 권한을 가지고 있는지 확인한다.
    protected abstract boolean isClientHasPermission(Subscribable subscribable, String clientId);

    // destination에 대한 clientId가 권한을 가지고 있는 경우 호출되는 메서드
    public abstract void handle(String destination, String clientId);
}
