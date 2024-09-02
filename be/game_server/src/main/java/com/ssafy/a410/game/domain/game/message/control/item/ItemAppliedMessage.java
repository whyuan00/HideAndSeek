package com.ssafy.a410.game.domain.game.message.control.item;

import lombok.Getter;

@Getter
public class ItemAppliedMessage extends ItemMessage {

    public ItemAppliedMessage(ItemInfo itemInfo, String requestId) {
        super(ItemControlType.ITEM_APPLIED_TO_PLAYER, itemInfo, requestId);
    }
}
