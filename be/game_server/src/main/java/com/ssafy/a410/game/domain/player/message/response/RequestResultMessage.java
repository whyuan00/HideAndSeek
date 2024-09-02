package com.ssafy.a410.game.domain.player.message.response;

import com.ssafy.a410.common.domain.message.ControlMessage;
import lombok.Getter;

@Getter
public class RequestResultMessage extends ControlMessage {
    private final String requestId;

    public RequestResultMessage(PlayerRequestType type, Object data, String requestId) {
        super(type.name(), data, requestId);
        this.requestId = requestId;
    }
}
