package com.ssafy.a410.game.domain.player.message.control;

public class PlayerUnfreezeMessage extends PlayerControlMessage {
    public PlayerUnfreezeMessage() {
        super(PlayerControlType.UNFREEZE, null);
    }
}
