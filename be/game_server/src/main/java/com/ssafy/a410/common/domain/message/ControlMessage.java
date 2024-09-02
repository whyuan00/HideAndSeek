package com.ssafy.a410.common.domain.message;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * 서버로부터 클라이언트에 전달되는 제어 메시지
 */
@RequiredArgsConstructor
@Getter
public class ControlMessage {
    private final String type;
    private final Object data;
    private final String requestId;
}
