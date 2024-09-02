package com.ssafy.a410.game.domain.game.message.control;

import com.ssafy.a410.common.domain.message.ControlMessage;
import lombok.Getter;

/**
 * 게임 관련 제어 메시지
 */
@Getter
public class GameControlMessage extends ControlMessage {
    public GameControlMessage(GameControlType type, Object data) {
        super(type.name(), data, null);
    }
}
