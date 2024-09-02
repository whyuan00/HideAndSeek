package com.ssafy.a410.socket.handler;

import com.ssafy.a410.game.domain.game.Game;
import com.ssafy.a410.game.service.GameService;
import com.ssafy.a410.room.domain.Room;
import com.ssafy.a410.room.service.RoomService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class DisconnectHandler {

    private final RoomService roomService;
    private final GameService gameService;

    public void disconnectAll(String playerId) {
        // 해당 플레이어를 포함하는 방을 찾아서 플레이어를 방에서 제거
        Room room = roomService.findRoomByPlayerId(playerId).orElseThrow(() -> new RuntimeException("Player not in room"));
        room.kick(room.getPlayerWith(playerId));

        // 플레이어가 나갔을 때 방에 아무도 남아 있지 않다면 방을 삭제
        if (room.getPlayers().isEmpty()) {
            roomService.removeRoom(room.getRoomNumber());
            return;
        }

        // 방에 누군가 남아있다면 해당 플레이어가 나갔음을 알림
        room.notifyDisconnection(room.getDisconnectedPlayerInfo(playerId));

        // 방에 진행 중인 게임이 있다면
        if (room.getPlayingGame() == null) {
            return;
        }

        // 나간 플레이어의 정보를 토대로
        Game game = room.getPlayingGame();
        Room.DisconnectedPlayerInfo disconnectedPlayerInfo = game.getRoom().getDisconnectedPlayerInfo(playerId);

        // 게임에 이탈 메시지를 보내고
        game.notifyDisconnection(disconnectedPlayerInfo);
        // 승패를 검사
        game.checkForVictory();
    }
}
