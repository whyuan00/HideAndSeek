package com.ssafy.a410.common.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorDetail {
    // 401 Unauthorized
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "E401000", "Unauthorized"),
    INVALID_ROOM_PASSWORD(HttpStatus.UNAUTHORIZED, "E401001", "Password is incorrect"),
    INVALID_LOGIN_ID(HttpStatus.UNAUTHORIZED, "E401002", "Invalid login id"),
    INVALID_PASSWORD(HttpStatus.UNAUTHORIZED, "E401003", "Invalid password"),
    LOGIN_FAILED(HttpStatus.UNAUTHORIZED, "E401004", "Invalid login credentials"),
    // 404 Not Found
    NOT_FOUND(HttpStatus.NOT_FOUND, "E404000", "Not Found"),
    HP_OBJECT_NOT_FOUND(HttpStatus.NOT_FOUND, "E404001", "HP Object not found"),
    PLAYER_NOT_FOUND(HttpStatus.NOT_FOUND, "E404002", "Player not found"),
    UNKNOWN_ITEM(HttpStatus.NOT_FOUND, "E404003", "Unknown item"),
    ROOM_NOT_FOUND(HttpStatus.NOT_FOUND, "E404004", "Room not found"),
    UNKNOWN_ITEM_OR_PLAYER_NOT_FOUND(HttpStatus.NOT_FOUND, "E404005", "Unknown item or player not found"),
    UNDEFINED_DIRECTION(HttpStatus.NOT_FOUND, "E404006", "Undefined direction"),
    // 409 Conflict
    CONFLICT(HttpStatus.CONFLICT, "E409000", "Conflict"),
    TEAM_IS_FULL(HttpStatus.CONFLICT, "E409001", "Team is full"),
    PLAYER_NOT_IN_TEAM(HttpStatus.CONFLICT, "E409002", "Player is not in team"),
    PLAYER_ALREADY_READY(HttpStatus.CONFLICT, "E409003", "Player is already ready to start"),
    CANNOT_JOIN_ROOM(HttpStatus.CONFLICT, "E409004", "Room is full or game has started"),
    PLAYER_NOT_IN_ROOM(HttpStatus.CONFLICT, "E409005", "Player is not in room"),
    HP_OBJECT_ALREADY_OCCUPIED(HttpStatus.CONFLICT, "E409006", "HP Object is already occupied"),
    DUPLICATE_ID(HttpStatus.CONFLICT, "E409007", "Duplicate ID"),
    DUPLICATE_NICKNAME(HttpStatus.CONFLICT, "E409008", "Duplicate nickname"),
    ;

    private final HttpStatus status;
    private final String detailCode;
    private final String detailMessage;
}
