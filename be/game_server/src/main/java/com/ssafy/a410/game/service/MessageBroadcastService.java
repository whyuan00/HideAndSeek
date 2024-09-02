package com.ssafy.a410.game.service;

import com.ssafy.a410.game.domain.game.Game;
import com.ssafy.a410.game.domain.player.Player;
import com.ssafy.a410.game.domain.team.Team;
import com.ssafy.a410.room.domain.Room;

/**
 * 게임 관련 메시지를 전달하는 서비스
 */
public interface MessageBroadcastService {
    void broadcastTo(Room room, Object message);

    void broadcastTo(Game game, Object message);

    void broadcastTo(Team team, Object message);

    void unicastTo(Player player, Object message);
}
