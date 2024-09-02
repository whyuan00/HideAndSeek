package com.ssafy.a410.room.domain.message.control;

import com.ssafy.a410.game.domain.player.Player;
import com.ssafy.a410.room.domain.Room;

import java.util.List;
import java.util.function.Predicate;

public record RoomMemberInfo(
        String playerId,
        String playerNickname
) {
    /**
     * 방에 참여해 있는 특정 조건을 만족하는 사용자들의 id와 nickname 목록을 반환한다.
     */
    private static List<RoomMemberInfo> getInfoListFrom(Room room, Predicate<Player> filter) {
        return room.getPlayers().values().stream()
                .filter(filter)
                .map(p -> new RoomMemberInfo(p.getId(), p.getNickname()))
                .toList();
    }

    /**
     * 방에 참여해 있는 모든 사용자들의 id와 nickname 목록을 반환한다.
     */
    public static List<RoomMemberInfo> getAllInfoListFrom(Room room) {
        return getInfoListFrom(room, p -> true);
    }

    /**
     * 방에 참여해 있는 게임 시작 준비가 된 사용자들의 id와 nickname 목록을 반환한다.
     */
    public static List<RoomMemberInfo> getReadyPlayerInfoListFrom(Room room) {
        return getInfoListFrom(room, Player::isReadyToStart);
    }
}
