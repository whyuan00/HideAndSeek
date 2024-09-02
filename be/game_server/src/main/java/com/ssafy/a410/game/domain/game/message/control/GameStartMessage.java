package com.ssafy.a410.game.domain.game.message.control;

public class GameStartMessage extends GameControlMessage {
    public GameStartMessage() {
        super(GameControlType.GAME_START, null);
    }
}
