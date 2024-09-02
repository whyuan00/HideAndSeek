package com.ssafy.a410.game.domain.game.message.control.item;

import com.ssafy.a410.game.domain.game.Item;
import lombok.Getter;

import java.time.Duration;

public record ItemInfo(
        String roomId,
        @Getter
        String playerId,
        String targetId, // 오브젝트 아이디 혹은 자기 자신
        Item item,
        Duration duration,
        int newSpeed,
        String appliedById // 자신에게 사용하는 아이템일 경우 자기 자신이 됨.
) {
    public ItemInfo{

        // 만약 targetId 가 null 값이 들어오면 playerId로 변환해준다.
        if (targetId == null){
            targetId = playerId;
        }

        // 만약 playerId 가 null 값이 들어오면 appliedById로 변환해준다
        if(playerId == null){
            playerId = appliedById;
        }
    }
//    public String getPlayerId(){
//        return playerId;
//    }
}
