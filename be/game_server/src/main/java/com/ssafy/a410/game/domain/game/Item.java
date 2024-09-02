package com.ssafy.a410.game.domain.game;

import com.ssafy.a410.common.exception.ErrorDetail;
import com.ssafy.a410.common.exception.ResponseException;

import java.time.Duration;

public enum Item {
    // 바나나
    BANANA,
    // 벌통
    BEEHIVE,
    // 고추
    RED_PEPPER,
    // 표고버섯
    MUSHROOM,
    // 독버섯
    POISON_MUSHROOM;

    public boolean isApplicableToPlayer() {
        return this == MUSHROOM || this == RED_PEPPER;
    }

    public boolean isApplicableToHPObject() {
        return this == BANANA || this == BEEHIVE || this == POISON_MUSHROOM;
    }

    public Duration getDuration() {
        switch (this) {
            case MUSHROOM:
                return Duration.ofSeconds(5);
            case RED_PEPPER:
                return Duration.ofSeconds(10);
            case BANANA:
                return Duration.ofSeconds(5);
            case BEEHIVE:
                return Duration.ofSeconds(5);
            case POISON_MUSHROOM:
                return Duration.ofSeconds(10);
            default:
                throw new ResponseException(ErrorDetail.UNKNOWN_ITEM);
        }
    }
}
