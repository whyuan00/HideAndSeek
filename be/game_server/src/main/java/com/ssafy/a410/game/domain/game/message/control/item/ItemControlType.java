package com.ssafy.a410.game.domain.game.message.control.item;

public enum ItemControlType {
    ITEM_CLEARED, // 아이템 효과 제거
    ITEM_APPLIED_TO_PLAYER, // 아이템 사용 성공
    ITEM_APPLIED_TO_OBJECT, // 아이템을 오브젝트에 사용 성공
    ITEM_APPLICATION_FAILED_TO_OBJECT, // 플레이어에게 아이템 사용 실패
    ITEM_APPLICATION_FAILED_TO_PLAYER, // 아이템 사용 실패
}
