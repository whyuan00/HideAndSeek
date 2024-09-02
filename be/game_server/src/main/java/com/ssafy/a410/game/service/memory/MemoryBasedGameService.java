package com.ssafy.a410.game.service.memory;

import com.ssafy.a410.common.exception.ErrorDetail;
import com.ssafy.a410.common.exception.ResponseException;
import com.ssafy.a410.game.controller.dto.PlayerPositionReq;
import com.ssafy.a410.game.domain.game.Game;
import com.ssafy.a410.game.domain.game.message.control.GameInfo;
import com.ssafy.a410.game.domain.game.message.control.GameInfoMessage;
import com.ssafy.a410.game.domain.player.Player;
import com.ssafy.a410.game.domain.player.PlayerDirection;
import com.ssafy.a410.game.domain.player.PlayerPosition;
import com.ssafy.a410.game.domain.player.message.request.PlayerPositionShareRequest;
import com.ssafy.a410.game.service.GameService;
import com.ssafy.a410.game.service.MessageBroadcastService;
import com.ssafy.a410.room.domain.Room;
import com.ssafy.a410.room.service.RoomService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.coyote.Response;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Slf4j
@RequiredArgsConstructor
@Service
public class MemoryBasedGameService implements GameService {
    private final RoomService roomService;
    private final MessageBroadcastService messageBroadcastService;

    @Override
    public Optional<Game> findGameByPlayerId(String playerId) {
        // roomService에서 방을 찾아와서 playingGame을 가져온다.
        Optional<Room> room = roomService.findRoomByPlayerId(playerId);
        if(room.isEmpty())
            throw new ResponseException(ErrorDetail.ROOM_NOT_FOUND);

        Game game = room.get().getPlayingGame();
        return Optional.ofNullable(game);
    }

    @Override
    public void sendGameInfoToPlayer(String roomId, String playerId, String requestId) {
        // 해당 방에 플레이어가 있는지 먼저 확인하고
        Room targetRoom = roomService.getRoomById(roomId);
        Player player = targetRoom.getPlayerWith(playerId);

        // 게임의 정보를 해당 플레이어의 채널로 전송
        GameInfo gameInfo = new GameInfo(targetRoom.playingGame, requestId);
        messageBroadcastService.unicastTo(player, new GameInfoMessage(gameInfo));
    }

    @Override
    public void sharePosition(String roomId, String userProfileUuid, PlayerPositionReq req) {
        // 해당 방에 플레이어가 있는지 먼저 확인하고
        Room targetRoom = roomService.getRoomById(roomId);
        Player player = targetRoom.getPlayerWith(userProfileUuid);
        Game game = targetRoom.playingGame;

        player.setX(req.x());
        player.setY(req.y());
        player.setDirection(PlayerDirection.valueOf(req.direction()));

//        // 위치 공유 메시지를 생성하여 Enque
//        PlayerPosition playerPosition = new PlayerPosition(userProfileUuid, req);
//        PlayerPositionShareRequest request = new PlayerPositionShareRequest(userProfileUuid, playerPosition);
//        game.pushMessage(player, request);
    }

    @Override
    public Game getGameByRoomId(String roomId) {
        Room room = roomService.getRoomById(roomId);
        if (room == null || room.getPlayingGame() == null)
            throw new ResponseException(ErrorDetail.ROOM_NOT_FOUND);
        return room.getPlayingGame();
    }
}
