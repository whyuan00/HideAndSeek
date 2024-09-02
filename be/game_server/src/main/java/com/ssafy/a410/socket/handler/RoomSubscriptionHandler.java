package com.ssafy.a410.socket.handler;

import com.ssafy.a410.room.domain.Room;
import com.ssafy.a410.room.service.RoomService;
import com.ssafy.a410.socket.domain.Subscribable;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@RequiredArgsConstructor
@Component
public class RoomSubscriptionHandler extends SocketSubscriptionHandler {

    private final RoomService roomService;

    @Override
    protected String getDestinationPattern() {
        return "/topic/rooms/[a-zA-Z0-9]+";
    }

    @Override
    protected Subscribable getSubscribableFrom(String destination) {
        String roomId = destination.substring(destination.lastIndexOf("/") + 1);
        return roomService.findRoomById(roomId).orElse(null);
    }

    @Override
    protected boolean isClientHasPermission(Subscribable subscribable, String clientId) {
        Room room = (Room) subscribable;
        return room.has(player -> player.getId().equals(clientId));
    }

    @Async
    @Override
    public void handle(String destination, String clientId) {
    }
}
