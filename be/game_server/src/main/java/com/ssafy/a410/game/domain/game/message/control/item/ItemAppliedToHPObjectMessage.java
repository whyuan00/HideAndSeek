package com.ssafy.a410.game.domain.game.message.control.item;

public class ItemAppliedToHPObjectMessage extends ItemMessage {
    public ItemAppliedToHPObjectMessage(ItemInfo itemInfo, String requestId) {
        super(ItemControlType.ITEM_APPLIED_TO_OBJECT, itemInfo, requestId);
    }
}

