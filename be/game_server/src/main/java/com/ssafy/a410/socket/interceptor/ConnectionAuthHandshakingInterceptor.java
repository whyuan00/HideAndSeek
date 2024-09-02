package com.ssafy.a410.socket.interceptor;

import com.ssafy.a410.auth.service.JWTService;
import com.ssafy.a410.auth.service.JWTType;
import com.ssafy.a410.auth.service.UserService;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.ArrayList;
import java.util.Map;

@Slf4j
@RequiredArgsConstructor
@Component
public class ConnectionAuthHandshakingInterceptor implements HandshakeInterceptor {
    private static final String CONNECTION_QUERY_PARAM_KEY = "token";
    private final JWTService jwtService;
    private final UserService userService;

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {
        String queryString = request.getURI().getQuery();
        for (String token : queryString.split("&")) {
            String[] tokenPair = token.split("=");
            String key = tokenPair[0];
            String value = tokenPair[1];

            // Query Parameter에서 임시 접속 JWT 토큰을 추출하여
            if (key.equals(CONNECTION_QUERY_PARAM_KEY)) {
                Claims claims = jwtService.getClaims(value);
                // 토큰 타입 체크
                String type = claims.get("type", String.class);
                if (!JWTType.WEBSOCKET_CONNECTION.equals(type)) {
                    return false;
                }

                // 실제로 존재하는 UserProfile인지 확인
                String userProfileUuid = claims.get("userProfileUuid", String.class);
                if (userProfileUuid == null || !userService.isExistUserProfile(userProfileUuid)) {
                    return false;
                }

                // 인증 정보 설정
                Authentication authentication = new UsernamePasswordAuthenticationToken(userProfileUuid, null, new ArrayList<>());
                SecurityContextHolder.getContext().setAuthentication(authentication);
                return true;
            }
        }

        return false;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler, Exception exception) {
    }
}
