package com.ssafy.a410.socket.handler;

import com.ssafy.a410.game.domain.player.Player;
import com.ssafy.a410.room.domain.Room;
import com.ssafy.a410.room.service.RoomService;
import com.ssafy.a410.socket.domain.Subscribable;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@RequiredArgsConstructor
@Component
public class PlayerSubscriptionHandler extends SocketSubscriptionHandler {
    private final RoomService roomService;

    @Override
    protected String getDestinationPattern() {
        return "/topic/rooms/.+/players/.+";
    }

    @Override
    protected Subscribable getSubscribableFrom(String destination) {
        String roomId = destination.split("/")[3];
        Room room = roomService.getRoomById(roomId);

        String playerId = destination.split("/")[5];
        return room.getPlayerWith(playerId);
    }

    @Override
    protected boolean isClientHasPermission(Subscribable subscribable, String clientId) {
        Player player = (Player) subscribable;
        return player.getId().equals(clientId);
    }

    @Override
    public void handle(String destination, String clientId) {
    }
}
