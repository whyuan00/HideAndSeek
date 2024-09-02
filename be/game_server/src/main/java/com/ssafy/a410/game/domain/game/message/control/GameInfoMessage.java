package com.ssafy.a410.game.domain.game.message.control;

import static com.ssafy.a410.game.domain.game.message.control.GameControlType.GAME_INFO;

public class GameInfoMessage extends GameControlMessage {
    public GameInfoMessage(GameInfo gameInfo) {
        super(GAME_INFO, gameInfo);
    }
}
