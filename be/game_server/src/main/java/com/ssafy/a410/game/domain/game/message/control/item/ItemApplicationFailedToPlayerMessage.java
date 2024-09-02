package com.ssafy.a410.game.domain.game.message.control.item;

import lombok.Getter;

@Getter
public class ItemApplicationFailedToPlayerMessage extends ItemMessage {

    public ItemApplicationFailedToPlayerMessage(ItemInfo itemInfo, String requestId) {
        super(ItemControlType.ITEM_APPLICATION_FAILED_TO_PLAYER, itemInfo, requestId);
    }
}
