package com.ssafy.a410.game.domain.game.message.control.interact;

public record InteractSeekInfo(String roomId, String playerId, String objectId, int catchCount, String foundPlayerId) {

    public InteractSeekInfo {
        if(foundPlayerId == null){
            // null값으로 들어올때 NONE으로 기본값처리
            foundPlayerId = "NONE";
        }
    }
}