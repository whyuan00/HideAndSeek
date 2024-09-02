package com.ssafy.a410.game.domain.game.message.control;

import com.ssafy.a410.game.domain.game.Phase;

import java.time.LocalDateTime;

public record PhaseInfo(
        Phase phase,
        long finishAfterMilliSec,
        LocalDateTime changeAt
) {
    public static PhaseInfo of(Phase phase, long finishAfterMilliSec) {
        // Set changeAt the time after finishAfterMilliSec
        return new PhaseInfo(phase, phase.getDuration() + finishAfterMilliSec, LocalDateTime.now().plusNanos((phase.getDuration() + finishAfterMilliSec) * 1_000_000));
    }
}
