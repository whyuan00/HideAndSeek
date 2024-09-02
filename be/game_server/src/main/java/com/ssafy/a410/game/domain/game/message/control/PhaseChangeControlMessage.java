package com.ssafy.a410.game.domain.game.message.control;

import com.ssafy.a410.game.domain.game.Phase;

public class PhaseChangeControlMessage extends GameControlMessage {
    public PhaseChangeControlMessage(Phase phase, long additionalDurationMilliSec) {
        super(GameControlType.PHASE_CHANGE, PhaseInfo.of(phase, additionalDurationMilliSec));
    }

    public PhaseChangeControlMessage(Phase phase) {
        this(phase, 0);
    }
}
