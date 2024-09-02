package com.ssafy.a410.game.domain.game.item;

import com.ssafy.a410.game.domain.game.Game;
import com.ssafy.a410.game.domain.game.Item;
import com.ssafy.a410.game.domain.player.Player;
import com.ssafy.a410.game.domain.player.message.request.GamePlayerRequest;
import com.ssafy.a410.game.domain.player.message.request.GamePlayerRequestType;
import com.ssafy.a410.game.domain.team.Team;
import com.ssafy.a410.game.service.MessageBroadcastService;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ItemUseReq extends GamePlayerRequest {
    private String roomId;
    private final String targetId;
    private final Item item;
    private String playerId;

    public ItemUseReq(String playerId, String targetId, Item item, String requestId) {
        super(playerId, GamePlayerRequestType.ITEM_USE, null, requestId);
        this.targetId = targetId;
        this.item = item;
        setRequestId(requestId);
    }

    @Override
    public void handle(Player requestedPlayer, Team senderTeam, Game game, MessageBroadcastService broadcastService) {
        game.handleItemUseRequest(this);
    }
}
