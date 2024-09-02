package com.ssafy.a410.game.service.socket;

import com.ssafy.a410.game.domain.game.Game;
import com.ssafy.a410.game.domain.player.Player;
import com.ssafy.a410.game.domain.team.Team;
import com.ssafy.a410.game.service.MessageBroadcastService;
import com.ssafy.a410.room.domain.Room;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class WebSocketMessageBroadcastService implements MessageBroadcastService {
    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketMessageBroadcastService(@Lazy SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @Override
    public void broadcastTo(Room room, Object message) {
        messagingTemplate.convertAndSend(room.getTopic(), message);
    }

    @Override
    public void broadcastTo(Game game, Object message) {
        messagingTemplate.convertAndSend(game.getTopic(), message);
    }

    @Override
    public void broadcastTo(Team team, Object message) {
        messagingTemplate.convertAndSend(team.getTopic(), message);
    }

    @Override
    public void unicastTo(Player player, Object message) {
        messagingTemplate.convertAndSend(player.getTopic(), message);
    }
}
