package com.ssafy.a410.socket.handler;

import com.ssafy.a410.common.exception.ErrorDetail;
import com.ssafy.a410.common.exception.ResponseException;
import com.ssafy.a410.game.domain.game.Game;
import com.ssafy.a410.room.domain.Room;
import com.ssafy.a410.room.service.RoomService;
import com.ssafy.a410.socket.domain.Subscribable;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@RequiredArgsConstructor
@Component
public class GameSubscriptionHandler extends SocketSubscriptionHandler {
    private final RoomService roomService;

    @Override
    protected String getDestinationPattern() {
        return "/topic/rooms/[a-zA-Z0-9]+/game";
    }

    @Override
    protected Subscribable getSubscribableFrom(String destination) {
        String roomId = destination.split("/")[3];
        Room room = roomService.findRoomById(roomId).orElseThrow(() -> new ResponseException(ErrorDetail.ROOM_NOT_FOUND));
        return room.getPlayingGame();
    }

    @Override
    protected boolean isClientHasPermission(Subscribable subscribable, String clientId) {
        Game game = (Game) subscribable;
        return game.getRoom().has(player -> player.getId().equals(clientId));
    }

    @Override
    public void handle(String destination, String clientId) {
    }
}
