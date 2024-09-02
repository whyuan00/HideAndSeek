package com.ssafy.a410.game.domain.player.message.control;

public enum PlayerControlType {
    FREEZE, // 플레이어가 움직이지 않도록 함
    UNFREEZE, // 플레이어가 움직일 수 있도록 함
    COVER_SCREEN, // 화면 가리기
    UNCOVER_SCREEN, // 화면 가리기 해제
    INITIALIZE_PLAYER, // 플레이어 초기 정보 설정
    SHARE_POSITION, // 플레이어 위치 공유
}
