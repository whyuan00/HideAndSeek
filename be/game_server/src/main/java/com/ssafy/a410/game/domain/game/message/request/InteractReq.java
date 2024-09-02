package com.ssafy.a410.game.domain.game.message.request;

import com.ssafy.a410.game.domain.player.message.request.GamePlayerRequest;
import com.ssafy.a410.game.domain.player.message.request.GamePlayerRequestType;

public abstract class InteractReq extends GamePlayerRequest {
    public InteractReq(String playerId, GamePlayerRequestType type, Object data, String requestId) {
        super(playerId, type, data, requestId);
    }
}
