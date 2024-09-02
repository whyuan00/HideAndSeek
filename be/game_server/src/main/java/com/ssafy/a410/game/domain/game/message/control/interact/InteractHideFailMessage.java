package com.ssafy.a410.game.domain.game.message.control.interact;

import com.ssafy.a410.game.domain.game.Item;
import lombok.Getter;
import java.util.Map;

@Getter
public class InteractHideFailMessage extends InteractHideMessage {
    public InteractHideFailMessage(String roomId, String playerId, String objectId, Item item, String requestId) {
        super(InteractType.INTERACT_HIDE_FAIL, Map.of(
                "roomId", roomId,
                "playerId", playerId,
                "objectId", objectId,
                "item", item != null ? item.name() : "NONE"
        ), requestId);
    }
}
