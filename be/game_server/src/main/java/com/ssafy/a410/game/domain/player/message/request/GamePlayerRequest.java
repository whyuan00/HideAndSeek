package com.ssafy.a410.game.domain.player.message.request;

import com.ssafy.a410.game.domain.game.Game;
import com.ssafy.a410.game.domain.player.Player;
import com.ssafy.a410.game.domain.team.Team;
import com.ssafy.a410.game.service.MessageBroadcastService;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

/**
 * 플레이어로부터 서버에 도달한 비동기 요청 메시지
 */
@Getter
@AllArgsConstructor
public abstract class GamePlayerRequest {
    private final String playerId;
    private final GamePlayerRequestType type;
    private final Object data;
    @Setter
    private String requestId;

    public abstract void handle(Player requestedPlayer, Team senderTeam, Game game, MessageBroadcastService broadcastService);
}
