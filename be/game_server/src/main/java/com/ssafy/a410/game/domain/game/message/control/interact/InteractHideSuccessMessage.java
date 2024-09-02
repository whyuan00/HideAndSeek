package com.ssafy.a410.game.domain.game.message.control.interact;

import lombok.Getter;
import java.util.Map;

@Getter
public class InteractHideSuccessMessage extends InteractHideMessage {
    public InteractHideSuccessMessage(String roomId, String playerId, String objectId, String requestId) {
        super(InteractType.INTERACT_HIDE_SUCCESS, Map.of(
                "roomId", roomId,
                "playerId", playerId,
                "objectId", objectId
        ), requestId);
    }
}
