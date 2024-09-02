package com.ssafy.a410.game.domain.game.message.control;

import com.ssafy.a410.game.domain.player.PlayerStatsResp;
import lombok.Getter;

import java.util.List;
import java.util.Map;

@Getter
public class GameResultMessage extends GameControlMessage {

    public GameResultMessage(Map<String, List<PlayerStatsResp>> stats) {
        super(GameControlType.GAME_RESULT, stats);
    }
}
