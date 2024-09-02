package com.ssafy.a410.game.domain.game.message.control.interact;

import com.ssafy.a410.common.domain.message.ControlMessage;
import lombok.Getter;

@Getter
public class InteractControlMessage extends ControlMessage {
    public InteractControlMessage(InteractType type, Object data, String requestId) {
        super(type.name(), data, requestId);
    }
}
