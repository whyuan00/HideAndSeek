package com.ssafy.a410.socket.domain;

import org.apache.commons.lang3.RandomStringUtils;

/**
 * 해당 인터페이스를 구현하는 클래스는 상태 변화를 비동기적으로 수신할 수 있음을 의미함
 * 구독자는 해당 클래스 인스턴스의 topic에 구독하고, 구독할 때 인스턴스에 부여된 subscriptionToken을 함께 전달해야 함
 */
public abstract class Subscribable {
    private final int SUBSCRIPTION_TOKEN_LENGTH = 30;
    protected final String randomSubscriptionToken = getRandomSubscriptionToken();

    public abstract String getTopic();

    public String getSubscriptionToken() {
        return randomSubscriptionToken;
    }

    public boolean isCorrectSubscriptionToken(String token) {
        return randomSubscriptionToken.equals(token);
    }

    protected String getRandomSubscriptionToken() {
        return RandomStringUtils.randomAlphanumeric(SUBSCRIPTION_TOKEN_LENGTH);
    }
}
