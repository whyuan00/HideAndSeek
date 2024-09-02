package com.ssafy.a410.game.domain.game.message;

import com.ssafy.a410.game.domain.game.message.control.GameControlMessage;
import com.ssafy.a410.game.domain.game.message.control.GameControlType;
import lombok.Getter;

import java.util.Map;

@Getter
public class EliminationUnHidePlayersMessage extends GameControlMessage {

    private final String playerId;
    private final String team;

    public EliminationUnHidePlayersMessage(String playerId, String team) {
        super(GameControlType.FAILED_TO_HIDE, Map.of("playerId", playerId, "team", team));
        this.playerId = playerId;
        this.team = team;
    }
}
