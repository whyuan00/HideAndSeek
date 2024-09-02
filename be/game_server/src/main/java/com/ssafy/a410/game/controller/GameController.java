package com.ssafy.a410.game.controller;

import com.ssafy.a410.game.controller.dto.BlockingReq;
import com.ssafy.a410.game.controller.dto.PlayerPositionReq;
import com.ssafy.a410.game.domain.game.item.ItemUseReq;
import com.ssafy.a410.game.domain.game.message.request.InteractHideReq;
import com.ssafy.a410.game.domain.game.message.request.InteractSeekReq;
import com.ssafy.a410.game.service.GameService;
import com.ssafy.a410.game.service.InteractService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;


@Slf4j
@RequiredArgsConstructor
@RestController
public class GameController {
    private final GameService gameService;
    private final InteractService interactService;

    // 요청한 클라이언트에게 개인 채널로 방에 대한 정보를 송신한다.
    @MessageMapping("/rooms/{roomId}/game")
    public void sendGameInfoToPlayer(@DestinationVariable String roomId, @Payload BlockingReq<Void> req, Principal principal) {
        gameService.sendGameInfoToPlayer(roomId, principal.getName(), req.getRequestId());
    }

    // 클라이언트의 위치를 게임에 공유한다.
    @MessageMapping("/rooms/{roomId}/game/share-position")
    public void sharePosition(@DestinationVariable String roomId, Principal principal, PlayerPositionReq playerPositionReq) {
        gameService.sharePosition(roomId, principal.getName(), playerPositionReq);
    }

    // 오브젝트와 상호작용해서 숨는다.
    @MessageMapping("/rooms/{roomId}/game/hide")
    public void hideOnHPObject(@DestinationVariable String roomId, Principal principal, @Payload BlockingReq<InteractHideReq> req) {
        InteractHideReq interactHideReq = req.getData();
        interactHideReq.setRequestId(req.getRequestId());
        interactHideReq.setPlayerId(principal.getName());
        interactHideReq.setRoomId(roomId);
        interactService.hideOnHPObject(interactHideReq);
    }

    // 오브젝트와 상호작용하여 숨은 플레이어 탐색을 시도한다.
    @MessageMapping("/rooms/{roomId}/game/seek")
    public void seekObject(@DestinationVariable String roomId, @Payload BlockingReq<InteractSeekReq> req, Principal principal) {
        InteractSeekReq interactSeekReq = req.getData();
        interactSeekReq.setRequestId(req.getRequestId());
        interactSeekReq.setPlayerId(principal.getName());
        interactSeekReq.setRoomId(roomId);
        interactService.seekObject(interactSeekReq);
    }

    // 아이템을 사용한다.
    @MessageMapping("/rooms/{roomId}/game/use/item")
    public void useItem(@DestinationVariable String roomId, @Payload BlockingReq<ItemUseReq> req, Principal principal) {
        ItemUseReq itemUseReq = req.getData();
        itemUseReq.setPlayerId(principal.getName());
        itemUseReq.setRoomId(roomId);
        itemUseReq.setRequestId(req.getRequestId());
        interactService.useItem(itemUseReq);
    }

    // 게임 결과 전송 엔드포인트, 게임 종료 시 broadCast해주는 것으로 대체
//    @GetMapping("rooms/{roomId}/game/result")
//    public ResponseEntity<Map<String, List<PlayerStatsResp>>> getEndGameStats(@PathVariable String roomId) {
//        Game game = gameService.getGameByRoomId(roomId);
//        Map<String, List<PlayerStatsResp>> stats = game.getEndGameStats();
//        return ResponseEntity.ok(stats);
//    }
}
