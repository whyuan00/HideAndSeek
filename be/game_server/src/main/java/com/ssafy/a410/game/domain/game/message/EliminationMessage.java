package com.ssafy.a410.game.domain.game.message;

import com.ssafy.a410.game.domain.game.message.control.GameControlMessage;
import com.ssafy.a410.game.domain.game.message.control.GameControlType;
import lombok.Getter;

import java.util.Map;

@Getter
public class EliminationMessage extends GameControlMessage {
    private final String playerId;
    private final String team;

    public EliminationMessage(String playerId, String team) {
        super(GameControlType.ELIMINATION, Map.of("playerId", playerId, "team", team));
        this.playerId = playerId;
        this.team = team;
    }
}
