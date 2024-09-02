package com.ssafy.a410.game.domain.game.message.control;

public class RoundChangeControlMessage extends GameControlMessage {
    public RoundChangeControlMessage(int nextRound, int totalRound) {
        super(GameControlType.ROUND_CHANGE, new RoundInfo(nextRound, totalRound));
    }
}
