package com.ssafy.a410.game.domain.player.message.request;

public enum GamePlayerRequestType {
    MOVEMENT_SHARE, // 플레이어의 움직임을 공유
    INTERACT_HIDE,  // 플레이어가 오브젝트와 상호작용하여 숨기
    INTERACT_SEEK, // 찾는팀 플레이어가 오브젝트 탐색 시도
    ITEM_USE,
}
