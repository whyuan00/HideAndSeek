package com.ssafy.a410.game.domain.game;

import com.google.gson.JsonObject;
import com.ssafy.a410.common.exception.ErrorDetail;
import com.ssafy.a410.common.exception.ResponseException;
import com.ssafy.a410.game.domain.player.Player;
import lombok.Getter;
import lombok.Setter;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

@Getter
public class HPObject extends GameObject {
    // 숨어있거나, 아이템을 숨긴 플레이어
    private Player player;
    // 플레이어가 숨어있는 경우 Item = null
    private Item appliedItem;
    // 아이템이 적용 된 시간
    private LocalDateTime itemAppliedTime;
    // 아이템 지속 시간
    private Duration itemDuration;
    // 아이템을 적용시킨 플레이어 아이디
    private String appliedById;

    @Setter
    private Game game;

    public HPObject(JsonObject jsonObject) {
        super(jsonObject);
        this.player = null;
        this.appliedItem = null;
    }

    // HPObject가 비어있는지 확인하는 함수
    public boolean isEmpty() {
        return this.player == null && this.appliedItem == null;
    }

    // 플레이어를 숨기는 것을 해제하는 함수
    public void unhidePlayer() {
        this.player = null;
    }

    // 아이템을 해제하는 함수
    public void removeItem() {
        this.appliedItem = null;
    }

    // 플레이어 숨는 함수
    public void hidePlayer(Player player) {
        extracted();
        if (this.getId() == null) {
            throw new ResponseException(ErrorDetail.HP_OBJECT_NOT_FOUND);
        }
        this.player = player;
    }

    // 해당 HP에 누군가가 있거나 어떤 아이템이 적용되어있다면.
    private void extracted() {
        if (!isEmpty()) {
            throw new ResponseException(ErrorDetail.HP_OBJECT_ALREADY_OCCUPIED);
        }
    }

    // 플레이어 추출
    public Player extractHidingPlayer() {
        Player foundPlayer = this.player;
        unhidePlayer();
        return foundPlayer;
    }

    // 아이템 추출
    public Item extractItem() {
        Item foundItem = this.appliedItem;
        removeItem();
        return foundItem;
    }

    // 해당 오브젝트에 대해 탐색
    public boolean isSeekSuccess(Player seekingPlayer) {
        return this.player != null; // 플레이어를 찾은 경우
// 빈 오브젝트인 경우
    }

    public void applyItem(Item item, Duration duration, String appliedById) {
        this.appliedItem = item;
        this.itemDuration = duration;
        this.appliedById = appliedById;
        this.itemAppliedTime = null;
    }

    public void activeItem(Player player) {
        //item 이 없거나 이미 활성화 되어있는 아이템
        if (appliedItem == null || isItemActive()) return;
        this.itemAppliedTime = LocalDateTime.now();

        switch (appliedItem) {
            case BANANA:
                player.setSpeed(player.getSpeed() / 2);
                break;
            case BEEHIVE:
                player.setSpeed(0);
                break;
            default:
                throw new ResponseException(ErrorDetail.UNKNOWN_ITEM);
        }
        // 해당 아이템이 탐지된 후에 Duration 적용
        scheduleItemRemoval(itemDuration);
    }

    // 아이템 효과 종료
    public void clearItem() {
        this.appliedItem = null;
        this.itemAppliedTime = null;
        this.itemDuration = null;
        this.appliedById = null;
    }

    // 아이템이 활성 상태인지 확인
    public boolean isItemActive() {
        boolean isActive = appliedItem != null && itemAppliedTime != null &&
                Duration.between(itemAppliedTime, LocalDateTime.now()).compareTo(itemDuration) < 0;
        if (!isActive) {
            clearItem();
        }
        return isActive;
    }

    // 아이템 지속시간 종료 시 효과 해제
    private void scheduleItemRemoval(Duration duration) {
        Executors.newScheduledThreadPool(1).schedule(() -> {
            clearItem();
            game.notifyHPItemCleared(this);
        }, duration.toMillis(), TimeUnit.MILLISECONDS);
    }
}



