package com.ssafy.a410.game.domain.player.message.control;

import com.ssafy.a410.game.domain.player.PlayerPosition;

public class PlayerPositionMessage extends PlayerControlMessage {
    public PlayerPositionMessage(PlayerPosition playerPosition) {
        super(PlayerControlType.SHARE_POSITION, playerPosition);
    }
}
