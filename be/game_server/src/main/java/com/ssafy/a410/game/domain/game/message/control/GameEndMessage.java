package com.ssafy.a410.game.domain.game.message.control;

import com.ssafy.a410.game.domain.team.Team;

import java.util.Map;

public class GameEndMessage extends GameControlMessage {
    public GameEndMessage(Team winningTeam, Team losingTeam) {
        super(GameControlType.GAME_END, Map.of(
                "WINNING_TEAM", winningTeam.getCharacter(),
                "LOSING_TEAM", losingTeam.getCharacter()
        ));
    }
}
