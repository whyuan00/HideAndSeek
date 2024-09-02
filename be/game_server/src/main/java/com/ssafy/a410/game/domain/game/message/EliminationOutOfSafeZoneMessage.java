package com.ssafy.a410.game.domain.game.message;

import com.ssafy.a410.game.domain.game.message.control.GameControlMessage;
import com.ssafy.a410.game.domain.game.message.control.GameControlType;

import java.util.Map;

public class EliminationOutOfSafeZoneMessage extends GameControlMessage {
    private final String playerId;
    private final String team;

    public EliminationOutOfSafeZoneMessage(String playerId, String team) {
        super(GameControlType.ELIMINATION_OUT_OF_SAFE_ZONE, Map.of("playerId", playerId, "team", team));
        this.playerId = playerId;
        this.team = team;
    }
}

