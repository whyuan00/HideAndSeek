package com.ssafy.a410.game.domain.game;

import com.ssafy.a410.common.constant.MilliSecOf;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Getter
public enum Phase {
    // 게임을 초기화 하고 있는 상태
    INITIALIZING(500, 0L),
    // 게임이 시작할 준비가 된 상태
    INITIALIZED(1000, 0L),
    // 숨는 팀이 숨을 곳을 찾는 상태
    READY(2000, 10L * MilliSecOf.SECONDS),
    // 찾는 팀이 숨은 팀을 찾고 있는 상태
    MAIN(3000, 20L * MilliSecOf.SECONDS),
    // 다음 라운드를 위해 기존의 게임 상태를 정리 하고 있는 상태
    END(4000, MilliSecOf.SECONDS),
    // 게임이 끝난 상태
    FINISHED(5000, 0L);

    /*
    INITIALIZING(500, 0L),
    // 게임이 시작할 준비가 된 상태
    INITIALIZED(1000, 0L),
    // 숨는 팀이 숨을 곳을 찾는 상태
    READY(2000, 10L * MilliSecOf.SECONDS),
    // 찾는 팀이 숨은 팀을 찾고 있는 상태
    MAIN(3000, 10L * MilliSecOf.SECONDS),
    // 다음 라운드를 위해 기존의 게임 상태를 정리 하고 있는 상태
    END(4000, MilliSecOf.SECONDS),
    // 게임이 끝난 상태
    FINISHED(5000, 0L);
     */

    private final int value;
    private final long duration;

    public boolean isAfter(Phase other) {
        return this.value > other.value;
    }

    public boolean isNowOrAfter(Phase other) {
        return this.value >= other.value;
    }

    public boolean isBefore(Phase other) {
        return this.value < other.value;
    }

    public boolean isNowOrBefore(Phase other) {
        return this.value <= other.value;
    }
}
