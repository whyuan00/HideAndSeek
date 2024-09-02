package com.ssafy.a410.auth.controller.dto;

public record GuestSignUpResp(
        String accessToken,
        UserProfileResp userProfile,
        String webSocketConnectionToken
) {
}
