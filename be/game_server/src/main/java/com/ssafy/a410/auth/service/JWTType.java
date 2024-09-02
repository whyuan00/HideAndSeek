package com.ssafy.a410.auth.service;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Getter
public enum JWTType {
    // API 인증 토큰
    AUTH_ACCESS("AUTH_ACCESS"),
    // API 인증 토큰 갱신 토큰
    AUTH_REFRESH("AUTH_REFRESH"),
    // 임시 인증 토큰 (방 출입 권한 확인 등에 사용)
    TEMPORARY("TEMPORARY"),
    // WebSocket Connection token
    WEBSOCKET_CONNECTION("WEBSOCKET_CONNECTION");

    public static final String TYPE_KEY = "type";

    private final String value;

    public boolean equals(String foe) {
        if (foe == null) {
            return false;
        }
        return this.getValue().equals(foe.toUpperCase());
    }
}
