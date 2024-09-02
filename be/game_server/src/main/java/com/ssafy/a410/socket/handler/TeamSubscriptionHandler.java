package com.ssafy.a410.socket.handler;

import com.ssafy.a410.game.domain.team.Team;
import com.ssafy.a410.room.domain.Room;
import com.ssafy.a410.room.service.RoomService;
import com.ssafy.a410.socket.domain.Subscribable;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@RequiredArgsConstructor
@Component
public class TeamSubscriptionHandler extends SocketSubscriptionHandler {
    private final RoomService roomService;

    @Override
    protected String getDestinationPattern() {
        return "/topic/rooms/[a-zA-Z0-9]+/game/teams/[a-zA-Z0-9]+";
    }

    @Override
    protected Subscribable getSubscribableFrom(String destination) {
        String[] split = destination.split("/");

        String roomNumber = split[3];
        Room room = roomService.findRoomById(roomNumber).orElse(null);
        if (room == null) {
            return null;
        }

        Team.Character teamCharacter = Team.Character.valueOf(split[6].toUpperCase());
        return room.getPlayingGame().getTeamOf(teamCharacter);
    }

    @Override
    protected boolean isClientHasPermission(Subscribable subscribable, String clientId) {
        Team team = (Team) subscribable;
        return team.getPlayerWithId(clientId) != null;
    }

    @Override
    public void handle(String destination, String clientId) {
    }
}
