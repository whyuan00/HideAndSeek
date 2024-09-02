package com.ssafy.a410.room.domain.message.control;

public enum RoomControlType {
    PLAYER_JOIN, // 사용자 참가
    PLAYER_READY, // 레디
    SUBSCRIBE_GAME, // 게임 구독 요청
    PLAYER_DISCONNECTED // 사용자 이탈
}
