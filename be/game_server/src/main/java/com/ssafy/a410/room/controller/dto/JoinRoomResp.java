package com.ssafy.a410.room.controller.dto;

import com.ssafy.a410.socket.controller.dto.SubscriptionInfoResp;

public record JoinRoomResp(
        SubscriptionInfoResp roomSubscriptionInfo,
        SubscriptionInfoResp playerSubscriptionInfo
) {
}
