package com.ssafy.a410.game.domain.player.message.control;

public class PlayerFreezeMessage extends PlayerControlMessage {
    public PlayerFreezeMessage() {
        super(PlayerControlType.FREEZE, null);
    }
}
