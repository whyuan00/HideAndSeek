package com.ssafy.a410.game.domain.game.message.control.interact;

public enum InteractType {
    INTERACT_HIDE_SUCCESS, // 오브젝트 상호작용 - 숨기성공
    INTERACT_HIDE_FAIL, // 오브젝트 상호작용 - 숨기 실패 / 오브젝트에 사람이 있거나 아이템이 있음
    INTERACT_SEEK_SUCCESS, // 오브젝트 상호작용 - 탐색 성공
    INTERACT_SEEK_FAIL, // 오브젝트 상호작용 - 탐색 실패 / 오브젝트에 사람이 없고 아이템이 있거나 없음
}
