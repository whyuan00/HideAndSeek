package com.ssafy.a410.room.domain.message.control;

import com.ssafy.a410.socket.controller.dto.SubscriptionInfoResp;

/**
 * 클라이언트에서 게임을 시작하기 위해 필요한 정보를 담음
 *
 * @param subscriptionInfo    구독 정보
 * @param startsAfterMilliSec 게임 시작까지 남은 시간 (ms)
 */
public record GameStartInfo(
        SubscriptionInfoResp subscriptionInfo,
        long startsAfterMilliSec
) {
}
