package com.ssafy.a410.auth.controller.dto;

public record LoginResp(String accessToken, UserProfileResp userProfile, String webSocketConnectionToken) {}
