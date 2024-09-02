package com.ssafy.a410.socket.controller.dto;

import com.ssafy.a410.socket.domain.Subscribable;

/**
 * 구독 정보
 *
 * @param topic 구독을 요청할 destination
 * @param token Authorization에 필요한 문자열 값
 */
public record SubscriptionInfoResp(
        String topic,
        String token
) {
    public SubscriptionInfoResp(Subscribable subscribable) {
        this(subscribable.getTopic(), subscribable.getSubscriptionToken());
    }
}
