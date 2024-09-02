package com.ssafy.a410.game.domain.player;

import com.ssafy.a410.auth.domain.UserProfile;
import com.ssafy.a410.common.exception.ErrorDetail;
import com.ssafy.a410.common.exception.ResponseException;
import com.ssafy.a410.game.domain.Pos;
import com.ssafy.a410.game.domain.game.Game;
import com.ssafy.a410.game.domain.game.Item;
import com.ssafy.a410.game.domain.game.message.EliminationUnHidePlayersMessage;
import com.ssafy.a410.game.service.MessageBroadcastService;
import com.ssafy.a410.room.domain.Room;
import com.ssafy.a410.socket.domain.Subscribable;
import lombok.Getter;
import lombok.Setter;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import static com.ssafy.a410.common.exception.ErrorDetail.PLAYER_ALREADY_READY;

@Getter
@Setter
public class Player extends Subscribable {
    // 기본 이동속도 200
    public static final int DEFAULT_SPEED = 200;
    // 플레이어 식별자
    private final String id;
    // 플레이어 이름
    private final String nickname;
    // 플레이어가 속한 방
    private final Room room;
    // 게임 시작 준비 여부
    private boolean readyToStart;
    // 위치
    private Pos pos;
    // 방향
    private PlayerDirection direction;
    // 움직일 수 없음을 표시
    private boolean isFreeze;
    // 플레이어가 살아있는 지 여부
    private boolean isEliminated;
    // 탐색 카운트
    private int seekCount;
    // 킬카운트
    private int catchCount;
    // 생존 시간 시작 시점
    private LocalDateTime startTime;
    // 생존 시간 종료 시점
    private LocalDateTime eliminationTime;
    // 해당 플레이어의 플레이타임
    private Duration playTime;
    // 봇 여부
    private boolean isBot;
    // 현재 속도 = 기본은 default_speed 로 설정
    private int speed = DEFAULT_SPEED;
    // 현재 player 에게 적용된 아이템
    private Item currentItem;
    // 아이템이 적용 된 시점의 시간
    private LocalDateTime itemAppliedTime;
    // 아이템의 지속 시간
    private Duration itemDuration;
    // 나한테 공격한 사람의 ID (HP 에 아이템을 숨겨놓은 사람)
    private String appliedById;
    // 플레이어가 가지고 있는 Item 리스트
    private List<Item> items = new ArrayList<>();


    public Player(UserProfile userProfile, Room room) {
        this(userProfile.getUuid(), userProfile.getNickname(), room);
    }

    public Player(String id, String nickname, Room room) {
        this.id = id;
        this.nickname = nickname;
        this.room = room;
        this.readyToStart = false;
        this.pos = new Pos(0, 0);
        this.seekCount = 0;
        this.catchCount = 0;
        this.isBot = false;
    }

    // 봇 생성자
    // TODO : id / nickname의 경우 수정할 경우 auth 통해서 받아오는 걸로
    public Player(Room room, boolean isBot) {
        // 나중에 uuid로 봇을 구분해서 움직이는 등의 게임 진행을 해야할 일이 있을까..?
        this.id = UUID.randomUUID().toString();
        // 랜덤 닉네임을 배정해줘야 하는가?
        this.nickname = "bot";
        this.room = room;
        this.pos = new Pos(0, 0);
        this.seekCount = 0;
        this.catchCount = 0;
        this.isBot = isBot;
    }

    public void setInitialPosition(double x, double y, PlayerDirection direction) {
        this.pos.setX(x);
        this.pos.setY(y);
        this.direction = direction;
        this.isFreeze = false;
    }

    // 방에 있는지 확인
    public boolean isIn(Room room) {
        return room.has(this);
    }

    // 게임 시작 준비 상태로 변경
    public void setReady() {
        if (this.readyToStart) {
            throw new ResponseException(PLAYER_ALREADY_READY);
        }
        this.readyToStart = true;
    }

    @Override
    public String getTopic() {
        return "/topic/rooms/" + room.getRoomNumber() + "/players/" + id;
    }

    public void freeze() {
        this.isFreeze = true;
    }

    public void unfreeze() {
        this.isFreeze = false;
    }

    public void setX(double x) {
        this.pos.setX(x);
    }

    public void setY(double y) {
        this.pos.setY(y);
    }

    public void eliminate() {
        this.isEliminated = true;
//        MessageBroadcastService broadcastService = room.getPlayingGame().getBroadcastService();
//        Game game = room.getPlayingGame();
//        String team = game.getPlayerTeam(this);
//        EliminationMessage message = new EliminationMessage(this.id, team);
//        broadcastService.unicastTo(this, message);
//        broadcastService.broadcastTo(game, message);
        // eliminate 당한시간 기록
        this.eliminationTime = LocalDateTime.now();
    }

    public void eliminateUnhidePlayers() {
        this.isEliminated = true;
        MessageBroadcastService broadcastService = room.getPlayingGame().getBroadcastService();
        Game game = room.getPlayingGame();
        String team = game.getPlayerTeam(this);
        EliminationUnHidePlayersMessage message = new EliminationUnHidePlayersMessage(this.id, team);
        broadcastService.unicastTo(this, message);
        broadcastService.broadcastTo(game, message);
        // eliminate 당한시간 기록
        this.eliminationTime = LocalDateTime.now();
    }

    public void eliminateOutOfSafeZone() {
        this.isEliminated = true;

        // eliminate 당한시간 기록
        this.eliminationTime = LocalDateTime.now();
    }

    public void increaseCatchCount() {
        this.catchCount++;
    }

    // 시작 시간 할당
    public void setPlayerStartTime() {
        this.startTime = LocalDateTime.now();
    }

    // 생존 시간 구하기
    public long getSurvivalTimeInSeconds() {
        LocalDateTime endTime = this.isEliminated ? this.eliminationTime : LocalDateTime.now();
        this.playTime = Duration.between(startTime, endTime);
        return playTime.getSeconds();
    }

    // 탐색 카운트 증가
    public void incrementSeekCount() {
        this.seekCount++;
    }

    // 탐색 카운트 초기화
    public void initSeekCount() {
        this.seekCount = 0;
    }

    // 방 재참가시 플레이어 초기화
    public void reset() {
        this.readyToStart = false;
        this.isEliminated = false;
        this.seekCount = 0;
        this.catchCount = 0;
        this.startTime = null;
        this.eliminationTime = null;
        this.playTime = null;
        this.speed = DEFAULT_SPEED;
        clearItem();
    }

    // 아이템 적용 메서드
    public void applyItem(Item item, Duration duration, String appliedById) {
        this.currentItem = item;
        this.itemAppliedTime = LocalDateTime.now();
        this.itemDuration = duration;
        this.appliedById = appliedById;

        switch (item) {
            case RED_PEPPER -> this.speed = 300;
            case BANANA -> this.speed = 100;
            case BEEHIVE -> this.speed = 0;
            case MUSHROOM -> applyMushroomEffect();
        }
        scheduleItemRemoval(duration);
    }

    // 라운드가 종료 될 때 한번 더 체크해줘야함
    public void clearItem() {
        this.currentItem = null;
        this.itemAppliedTime = null;
        this.itemDuration = null;
        this.speed = DEFAULT_SPEED;
        this.appliedById = null;
    }

    public boolean useItem(Item item) {
        if (items.contains(item)) {
            currentItem = item;
            items.remove(item);
            return true;
        }
        return false; // 이미 사용된 아이템이거나 존재하지 않으면 false 반환
    }

    private void scheduleItemRemoval(Duration duration) {
        Executors.newScheduledThreadPool(1).schedule(() -> {
            clearItem();
            room.getPlayingGame().notifyItemCleared(this);
        }, duration.toMillis(), TimeUnit.MILLISECONDS);
    }

    public DirectionArrow getDirectionTo(Player target) {
        double directionX = target.getPos().getX() - this.pos.getX();
        double directionY = target.getPos().getY() - this.pos.getY();

        // ArithmeticException 방지 위한 오차 설정
        final double TOLERANCE = 0.01;

        if (Math.abs(directionX) < TOLERANCE && directionY > 0) return DirectionArrow.DOWN;
        if (Math.abs(directionX) < TOLERANCE && directionY < 0) return DirectionArrow.UP;
        if (directionX > 0 && Math.abs(directionY) < TOLERANCE) return DirectionArrow.RIGHT;
        if (directionX < 0 && Math.abs(directionY) < TOLERANCE) return DirectionArrow.LEFT;
        if (directionX > 0 && directionY > 0) return DirectionArrow.DOWN_RIGHT;
        if (directionX > 0 && directionY < 0) return DirectionArrow.UP_RIGHT;
        if (directionX < 0 && directionY > 0) return DirectionArrow.DOWN_LEFT;
        if (directionX < 0 && directionY < 0) return DirectionArrow.UP_LEFT;

        throw new ResponseException(ErrorDetail.UNDEFINED_DIRECTION);
    }

    public void applyMushroomEffect() {
        room.getPlayingGame().applyMushroomEffect(this);
    }

    public void addItem(Item item) {
        items.add(item);
    }
}
