package com.ssafy.a410.game.domain.game.message.request;

import com.ssafy.a410.game.domain.game.Game;
import com.ssafy.a410.game.domain.game.GameMap;
import com.ssafy.a410.game.domain.game.HPObject;
import com.ssafy.a410.game.domain.game.Item;
import com.ssafy.a410.game.domain.game.message.control.interact.InteractSeekMessage;
import com.ssafy.a410.game.domain.game.message.control.item.ItemAppliedMessage;
import com.ssafy.a410.game.domain.game.message.control.item.ItemInfo;
import com.ssafy.a410.game.domain.player.Player;
import com.ssafy.a410.game.domain.team.Team;
import com.ssafy.a410.game.service.MessageBroadcastService;
import lombok.Getter;
import lombok.Setter;

import java.util.Map;

import static com.ssafy.a410.game.domain.player.message.request.GamePlayerRequestType.INTERACT_SEEK;

public class InteractSeekReq extends InteractReq {

    private static final int MAX_SEEK_COUNT = 5;
    private final String objectId;

    @Getter
    @Setter
    private String roomId;
    @Getter
    @Setter
    private String playerId;

    public InteractSeekReq(String playerId, String objectId, String requestId) {
        super(playerId, INTERACT_SEEK, null, requestId);
        this.objectId = objectId;
    }

    @Override
    public void handle(Player requestedPlayer, Team senderTeam, Game game, MessageBroadcastService broadcastService) {

        // requestedPlayer 의 탐색카운트가 허용범위 초과 일 때
        if (requestedPlayer.getSeekCount() >= MAX_SEEK_COUNT) {
            InteractSeekMessage message = InteractSeekMessage.failureMessage(
                    roomId,
                    requestedPlayer.getId(),
                    objectId,
                    requestedPlayer.getSeekCount(),
                    this.getRequestId()
            );
            broadcastService.unicastTo(requestedPlayer, message);
            return;
        }
        GameMap gameMap = game.getGameMap();
        Map<String, HPObject> hpObjects = gameMap.getHpObjects();
        HPObject hpObject = hpObjects.get(objectId);
        requestedPlayer.incrementSeekCount();

        if (hpObject.isSeekSuccess(requestedPlayer))
            handleSuccess(hpObject, requestedPlayer, game, broadcastService);
        else
            handleFailure(hpObject, requestedPlayer, game, broadcastService);
    }

    private void handleSuccess(HPObject hpObject, Player requestedPlayer, Game game, MessageBroadcastService broadcastService) {
        Player foundPlayer = hpObject.extractHidingPlayer();
        game.eliminate(foundPlayer);
        requestedPlayer.increaseCatchCount();

        InteractSeekMessage message = InteractSeekMessage.successMessage(
                roomId,
                requestedPlayer.getId(),
                objectId,
                foundPlayer.getId(),
                requestedPlayer.getSeekCount(),
                this.getRequestId()
        );
        broadcastService.broadcastTo(game, message);
        broadcastService.unicastTo(requestedPlayer, message);
        game.checkForVictory();
    }

    private void handleFailure(HPObject hpObject, Player requestedPlayer, Game game, MessageBroadcastService broadcastService) {
        Item installedItem = hpObject.extractItem();

        // 해당 오브젝트에 아이템이 있었다면 탐색자에게 적용
        if (installedItem != null) {
            requestedPlayer.applyItem(installedItem, installedItem.getDuration(), playerId);
            // 브로드캐스팅
            ItemInfo itemInfo = new ItemInfo(roomId, requestedPlayer.getId(), hpObject.getId(), installedItem, installedItem.getDuration(), requestedPlayer.getSpeed(), playerId);
            ItemAppliedMessage itemMessage = new ItemAppliedMessage(itemInfo, this.getRequestId());
            broadcastService.broadcastTo(game, itemMessage);
        }

        InteractSeekMessage message = InteractSeekMessage.failureMessage(
                roomId,
                requestedPlayer.getId(),
                objectId,
                requestedPlayer.getSeekCount(),
                this.getRequestId()
        );
        broadcastService.broadcastTo(game, message);
        broadcastService.unicastTo(requestedPlayer, message);
    }
}
