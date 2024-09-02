package com.ssafy.a410.game.domain.player.message.control;

import com.ssafy.a410.common.domain.message.ControlMessage;
import lombok.Getter;

/**
 * 게임을 플레이하고 있는 플레이어에 대한 제어 메시지
 */
@Getter
public class PlayerControlMessage extends ControlMessage {
    public PlayerControlMessage(PlayerControlType type, Object data) {
        super(type.name(), data, null);
    }
}
