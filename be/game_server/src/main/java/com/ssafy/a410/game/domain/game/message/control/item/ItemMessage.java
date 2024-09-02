package com.ssafy.a410.game.domain.game.message.control.item;

import com.ssafy.a410.common.domain.message.ControlMessage;

public class ItemMessage extends ControlMessage {
    public ItemMessage(ItemControlType type, Object data, String requestId) {
        super(type.name(), data, requestId);
    }
}
