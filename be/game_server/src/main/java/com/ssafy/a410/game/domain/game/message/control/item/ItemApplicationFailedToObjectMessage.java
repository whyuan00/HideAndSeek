package com.ssafy.a410.game.domain.game.message.control.item;

public class ItemApplicationFailedToObjectMessage extends ItemMessage {

    public ItemApplicationFailedToObjectMessage(ItemInfo itemInfo, String requestId) {
        super(ItemControlType.ITEM_APPLICATION_FAILED_TO_OBJECT, itemInfo, requestId);
    }
}

