package com.ssafy.a410.socket.controller.dto;

public record SubscriptionTokenResp(
        String token
) {
    public static final String SUBSCRIPTION_TOKEN_HEADER = "subscriptionToken";
    public static final String DESTINATION_KEY = "destination";
    public static final String CLIENT_ID_KEY = "clientId";
}
