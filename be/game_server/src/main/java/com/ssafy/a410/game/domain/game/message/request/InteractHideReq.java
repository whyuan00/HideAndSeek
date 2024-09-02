package com.ssafy.a410.game.domain.game.message.request;

import com.ssafy.a410.game.domain.game.Game;
import com.ssafy.a410.game.domain.game.GameMap;
import com.ssafy.a410.game.domain.game.HPObject;
import com.ssafy.a410.game.domain.game.Item;
import com.ssafy.a410.game.domain.game.message.control.interact.InteractHideFailMessage;
import com.ssafy.a410.game.domain.game.message.control.interact.InteractHideSuccessMessage;
import com.ssafy.a410.game.domain.player.Player;
import com.ssafy.a410.game.domain.team.Team;
import com.ssafy.a410.game.service.MessageBroadcastService;
import lombok.Getter;
import lombok.Setter;

import java.util.Map;
import java.util.Objects;

import static com.ssafy.a410.game.domain.player.message.request.GamePlayerRequestType.INTERACT_HIDE;

public class InteractHideReq extends InteractReq {
    private final String objectId;

    @Getter
    @Setter
    private String roomId;

    @Getter
    @Setter
    private String playerId;

    public InteractHideReq(String playerId, String objectId, String requestId) {
        super(playerId, INTERACT_HIDE, null, requestId);
        this.objectId = objectId;
    }

    @Override
    public void handle(Player requestedPlayer, Team senderTeam, Game game, MessageBroadcastService broadcastService) {
        GameMap gameMap = game.getGameMap();
        Map<String, HPObject> hpObjects = gameMap.getHpObjects();
        HPObject hpObject = hpObjects.get(objectId);

        // 유효하지 않은 오브젝트 ID인 경우 실패 메시지
        if (hpObject == null){
            InteractHideFailMessage failMessage = new InteractHideFailMessage(roomId, playerId, objectId, null, this.getRequestId());
            broadcastService.broadcastTo(game, failMessage);
            broadcastService.unicastTo(requestedPlayer, failMessage);
            return;
        }

        // 오브젝트가 이미 점유된 경우 실패 메시지
        if (!hpObject.isEmpty()){
            Item item = hpObject.getAppliedItem();
            InteractHideFailMessage failMessage = new InteractHideFailMessage(roomId, playerId, objectId, item, getRequestId());
            broadcastService.broadcastTo(game, failMessage);
            broadcastService.unicastTo(requestedPlayer, failMessage);
            return;
        }

        hpObject.hidePlayer(requestedPlayer);
        InteractHideSuccessMessage successMessage = new InteractHideSuccessMessage(roomId, playerId, objectId, this.getRequestId());
        broadcastService.broadcastTo(game, successMessage);
        broadcastService.unicastTo(requestedPlayer, successMessage);
    }
}
