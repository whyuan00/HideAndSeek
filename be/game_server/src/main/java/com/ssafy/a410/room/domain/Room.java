package com.ssafy.a410.room.domain;

import com.ssafy.a410.auth.domain.UserProfile;
import com.ssafy.a410.auth.service.UserService;
import com.ssafy.a410.common.constant.MilliSecOf;
import com.ssafy.a410.common.exception.ResponseException;
import com.ssafy.a410.common.exception.UnhandledException;
import com.ssafy.a410.game.domain.game.Game;
import com.ssafy.a410.game.domain.game.Item;
import com.ssafy.a410.game.domain.game.message.control.GameControlMessage;
import com.ssafy.a410.game.domain.game.message.control.GameControlType;
import com.ssafy.a410.game.domain.player.Player;
import com.ssafy.a410.game.domain.team.Team;
import com.ssafy.a410.game.service.MessageBroadcastService;
import com.ssafy.a410.room.domain.message.control.GameStartInfo;
import com.ssafy.a410.room.domain.message.control.RoomControlMessage;
import com.ssafy.a410.room.domain.message.control.RoomControlType;
import com.ssafy.a410.room.domain.message.control.RoomMemberInfo;
import com.ssafy.a410.socket.controller.dto.SubscriptionInfoResp;
import com.ssafy.a410.socket.domain.Subscribable;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Predicate;

import static com.ssafy.a410.common.exception.ErrorDetail.CANNOT_JOIN_ROOM;
import static com.ssafy.a410.common.exception.ErrorDetail.PLAYER_NOT_IN_ROOM;

@Slf4j
@Getter
public class Room extends Subscribable {
    // 한 방에 참가할 수 있는 최대 플레이어 수
    private static final int NUM_OF_MAX_PLAYERS = 8;

    // 방 참여 코드 (고유값)
    private final String roomNumber;
    // 방 비밀 번호
    private final String password;
    private final MessageBroadcastService broadcastService;
    private final Map<String, Player> players;
    private final UserService userService;
    private final Map<String, DisconnectedPlayerInfo> disconnectedPlayers = new ConcurrentHashMap<>();
    @Setter
    public Game playingGame;
    private Thread gameThread = null;

    public Room(String roomNumber, String password, MessageBroadcastService broadcastService, UserService userService) {
        this.roomNumber = roomNumber;
        this.password = password;
        this.broadcastService = broadcastService;
        this.userService = userService;
        players = new ConcurrentHashMap<>();
    }

    List<Item> createAvailableItems() {
        return Arrays.asList(Item.values());
    }

    /**
     * 방에 사용자를 추가하여 방에서 활동하게 될 플레이어의 정보를 반환한다.
     *
     * @param userProfile 사용자 정보
     * @return 방에 참여한 플레이어
     */
    public synchronized Player join(UserProfile userProfile) {
        if (!canJoin(userProfile)) {
            throw new ResponseException(CANNOT_JOIN_ROOM);
        } else {
            // 방에 새 플레이어를 추가하고
            Player player = new Player(userProfile, this);
            players.put(player.getId(), player);

            // 방에 참여한 플레이어들에게 방에 참여한 사용자들의 정보를 전달
            log.debug("플레이어 [{}]가 방 {}에 참여했습니다.", player.getNickname(), roomNumber);
            RoomControlMessage message = new RoomControlMessage(
                    RoomControlType.PLAYER_JOIN,
                    RoomMemberInfo.getAllInfoListFrom(this)
            );
            broadcastService.broadcastTo(this, message);

            return player;
        }
    }

    // 방에서 사용자를 제거한다.
    public synchronized void kick(Player player) {
        if (!has(player)) {
            throw new ResponseException(PLAYER_NOT_IN_ROOM);
        } else {
            players.remove(player.getId());
            addToDisconnectedPlayers(player);
        }
    }

    // 현재 실행 중인 게임이 있는지 확인
    public boolean hasPlayingGame() {
        synchronized (this) {
            return playingGame != null;
        }
    }

    // 공개된 방인지 확인
    public boolean isPublic() {
        return password == null || password.isEmpty();
    }

    // 방이 가득 찼는지 확인
    public boolean isFull() {
        return players.size() > NUM_OF_MAX_PLAYERS;
    }

    // 사용자가 방에 참가할 수 있는지 확인
    public boolean canJoin(UserProfile userProfile) {
        synchronized (this) {
            return !(isFull() || hasPlayingGame());
        }
    }

    // 방에 플레이어가 있는지 확인
    public boolean has(Player player) {
        return players.containsKey(player.getId());
    }

    public boolean has(Predicate<Player> predicate) {
        return players.values().stream().anyMatch(predicate);
    }

    // 해당 방에 참가하고 있는, 주어진 id를 가지는 플레이어를 반환
    public Player getPlayerWith(String playerId) {
        Player found = players.get(playerId);
        if (found == null) {
            throw new ResponseException(PLAYER_NOT_IN_ROOM);
        }
        return found;
    }

    // 방에 주어진 id를 가지는 사용자가 있는지 확인
    public boolean hasPlayerWith(String playerId) {
        return players.containsKey(playerId);
    }

    // 게임을 시작할 준비가 되었는지 확인
    public boolean isReadyToStartGame() {

        // 최소 시작인원은 2명 이상이여야함
        if (players.size() <= 1) {
            return false;
        }

        // 참가한 인원의 과반수 이상이 레디 상태여야 함
        long readyCount = players.values().stream().filter(Player::isReadyToStart).count();
        return readyCount > players.size() / 2;
    }

    // 게임 시작
    @Async
    public synchronized void startGame(MessageBroadcastService broadcastService) {
        // 게임이 할당되지 않았을 때만 아래 코드 블록이 실행되도록 구현
        if (playingGame != null) {
            return;
        }

        List<Item> items = createAvailableItems();
        playingGame = new Game(this, broadcastService, userService, items);

        // 게임 메시지 구독 명령
        final long STARTS_AFTER = 2L * MilliSecOf.SECONDS;
        RoomControlMessage message = new RoomControlMessage(
                RoomControlType.SUBSCRIBE_GAME,
                new GameStartInfo(new SubscriptionInfoResp(playingGame), STARTS_AFTER)
        );
        broadcastService.broadcastTo(this, message);

        // STARTS_IN만큼 지난 후 게임 시작
        try {
            log.debug("방 {}의 게임이 {}ms 뒤에 시작됩니다.", roomNumber, STARTS_AFTER);
            wait(STARTS_AFTER);
        } catch (InterruptedException e) {
            throw new UnhandledException("Game start interrupted");
        }

        gameThread = new Thread(playingGame);
        gameThread.start();
    }

    // 주어진 비밀번호로 인증할 수 있는지 확인
    public boolean isAuthenticatedWith(String password) {
        return isPublic() || this.password.equals(password);
    }

    @Override
    public String getTopic() {
        return "/topic/rooms/" + roomNumber;
    }

    public void notifyDisconnection(DisconnectedPlayerInfo disconnectedPlayerInfo) {
        GameControlMessage message = new GameControlMessage(
                GameControlType.PLAYER_DISCONNECTED,
                Map.of("playerId", disconnectedPlayerInfo.playerId, "team",
                        disconnectedPlayerInfo.teamCharacter == null ? "" : disconnectedPlayerInfo.teamCharacter)
        );
        broadcastService.broadcastTo(this, message);
    }

    public void endGame() {
        //게임 종료시 각자 player 들의 endTime 기록
        for (Player player : players.values()) {
            player.getSurvivalTimeInSeconds();
        }
        gameThread.interrupt();
        reset();
    }

    public void reset() {
        this.playingGame = null;
        this.gameThread = null;
    }

    private void addToDisconnectedPlayers(Player player) {
        disconnectedPlayers.put(player.getId(), new DisconnectedPlayerInfo(player));
    }

    public boolean hasDisconnectedPlayerWithId(String playerId) {
        return disconnectedPlayers.containsKey(playerId);
    }

    public DisconnectedPlayerInfo getDisconnectedPlayerInfo(String playerId) {
        return disconnectedPlayers.get(playerId);
    }

    @Getter
    public static class DisconnectedPlayerInfo {
        private final Team.Character teamCharacter;
        private final String playerId;

        public DisconnectedPlayerInfo(Player player) {
            this.playerId = player.getId();

            Game playingGame = player.getRoom().getPlayingGame();
            this.teamCharacter = playingGame == null ? null : playingGame.getTeamOf(player).getCharacter();
        }
    }
}