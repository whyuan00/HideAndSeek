package com.ssafy.a410.game.domain.game.message.control;

public enum GameControlType {
    GAME_START, // 게임 시작
    GAME_INFO, // 게임 정보
    ROUND_CHANGE, // 라운드 전환
    PHASE_CHANGE, // 페이즈 전환
    PLAYER_DISCONNECTED, // 유저 이탈
    SAFE_ZONE_UPDATE, // 안전 구역 업데이트
    ELIMINATION, // 사용자 탈락
    FAILED_TO_HIDE, // 숨지 못한 플레이어 사망처리
    GAME_END, // 게임 종료
    ELIMINATION_OUT_OF_SAFE_ZONE, // 안전 구역 밖에서의 탈락
    DIRECTION_HINT, // MUSHROOM 사용 시 , 메인페이즈가 시작 될 때 제공되는 방향 힌트
    GAME_RESULT, // 게임 결과 메시지
}
