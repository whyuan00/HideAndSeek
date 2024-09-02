package com.ssafy.a410.room.service.memory;

import com.ssafy.a410.auth.domain.UserProfile;
import com.ssafy.a410.auth.service.UserService;
import com.ssafy.a410.common.exception.ResponseException;
import com.ssafy.a410.common.exception.UnhandledException;
import com.ssafy.a410.game.domain.player.Player;
import com.ssafy.a410.game.service.socket.WebSocketMessageBroadcastService;
import com.ssafy.a410.room.controller.dto.JoinRandomRoomResp;
import com.ssafy.a410.room.controller.dto.JoinRoomResp;
import com.ssafy.a410.room.domain.Room;
import com.ssafy.a410.room.domain.message.control.RoomControlMessage;
import com.ssafy.a410.room.domain.message.control.RoomControlType;
import com.ssafy.a410.room.domain.message.control.RoomMemberInfo;
import com.ssafy.a410.room.service.RoomService;
import com.ssafy.a410.socket.controller.dto.SubscriptionInfoResp;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

import static com.ssafy.a410.common.exception.ErrorDetail.*;

@Slf4j
@Service
public class MemoryBasedRoomService implements RoomService {
    // 방의 번호를 생성하기 위한 변수 (WARNING : 멀티 스레드 환경에서 고유성을 보장해 주어야 함)
    private static int nextRoomNumber = 1000;
    // Key: 방 번호 (from `nextRoomNumber`), Value: Room
    private final Map<String, Room> rooms;
    private final UserService userService;
    private final WebSocketMessageBroadcastService broadcastService;

    public MemoryBasedRoomService(UserService userService, WebSocketMessageBroadcastService broadcastService) {
        this.rooms = new ConcurrentHashMap<>();
        this.userService = userService;
        this.broadcastService = broadcastService;
    }

    @Override
    public Room createRoom(String userProfileUuid, String password) {
        // 실제로 존재하는 사용자만 방을 만들 수 있음
        assertUserProfileExists(userProfileUuid);

        // 다음 번호로 방을 만들고, 방 목록에 추가한 다음
        Room room = new Room(Integer.toString(getNextRoomNumber()), password, broadcastService, userService);
        rooms.put(room.getRoomNumber(), room);

        // 생성된 방을 반환
        return room;
    }

    // 주어진 userProfileUuid를 가진 사용자가 존재하는지 확인
    private void assertUserProfileExists(String userProfileUuid) {
        if (!userService.isExistUserProfile(userProfileUuid)) {
            throw new UnhandledException("User profile not found assertion failed");
        }
    }

    // [1000, 9999] 범위 내의 고유한 방 번호를 생성
    private int getNextRoomNumber() {
        synchronized (MemoryBasedRoomService.class) {
            int roomNumber = nextRoomNumber++;
            // 9999번을 넘어가면 다시 1000부터 시작
            if (nextRoomNumber > 9999) {
                nextRoomNumber = 1000;
            }
            return roomNumber;
        }
    }

    // 해당 사용자를 방에 추가하여 플레이어로 만들고, 방에 참가 시킴
    @Override
    public Player joinRoom(Room room, UserProfile userProfile) {
        if (!room.canJoin(userProfile)) {
            throw new ResponseException(CANNOT_JOIN_ROOM);
        }
        if (room.getRoomNumber().isEmpty()) throw new ResponseException(ROOM_NOT_FOUND);

        return room.join(userProfile);
    }

    @Override
    public Player joinRoomWithPassword(String roomId, String userProfileUuid, String password) {
        Room room = getRoomById(roomId);
        UserProfile userProfile = userService.getUserProfileByUuid(userProfileUuid);
        if (!room.isAuthenticatedWith(password)) {
            throw new ResponseException(INVALID_ROOM_PASSWORD);
        }
        return joinRoom(room, userProfile);
    }

    @Override
    public void leaveRoom(Room room, Player player) {
        if (!room.has(player)) {
            throw new ResponseException(PLAYER_NOT_IN_ROOM);
        }
        room.kick(player);
        room.notifyDisconnection(new Room.DisconnectedPlayerInfo(player));

        if (room.getPlayers().isEmpty())
            rooms.remove(room.getRoomNumber());
    }

    @Override
    public void setPlayerReady(Room room, Player player) {
        if (!room.has(player)) {
            throw new ResponseException(PLAYER_NOT_IN_ROOM);
        }
        // 플레이어를 준비 시켜 놓고
        log.debug("플레이어 [{}]가 준비 되었습니다.", player.getNickname());
        player.setReady();

        // 다른 플레이어들에게 플레이어가 준비되었다고 알림
        RoomControlMessage message = new RoomControlMessage(
                RoomControlType.PLAYER_READY,
                RoomMemberInfo.getReadyPlayerInfoListFrom(room)
        );
        broadcastService.broadcastTo(room, message);

        // 실행할 수 있으면 게임 시작
        if (room.isReadyToStartGame()) {
            room.startGame(broadcastService);
        }
    }

    @Override
    public void setPlayerReady(String roomId, String userProfileUuid) {
        Room room = getRoomById(roomId);
        UserProfile userProfile = userService.getUserProfileByUuid(userProfileUuid);
        Player player = room.getPlayerWith(userProfile.getUuid());
        setPlayerReady(room, player);
    }

    @Override
    public Optional<Room> findRoomById(String roomId) {
        return Optional.ofNullable(rooms.get(roomId));
    }

    @Override
    public Optional<Room> findRoomByPlayerId(String playerId) {
        return rooms.values().stream()
                .filter(room -> room.hasPlayerWith(playerId))
                .findFirst();
    }

    @Override
    public void removeRoom(String roomId) {
        rooms.remove(roomId);
    }

    @Override
    // 입장 가능한 방을 찾는 함수
    public List<Room> findAvailableRooms() {
        List<Room> roomsWithLessThanEightPlayers = new ArrayList<>();

        for (Room room : rooms.values()) {
            // 방이 가득 차 있지 않고 게임이 시작하지 않은 경우 리스트에 추가
            if (!room.isFull() && !room.hasPlayingGame() && room.getPassword().isEmpty()) {
                roomsWithLessThanEightPlayers.add(room);
            }
        }

        return roomsWithLessThanEightPlayers;
    }

    @Override
    public Room getRoomHasDisconnectedPlayerInfoWithId(String playerId) {
        return rooms.values().stream()
                .filter(room -> room.hasDisconnectedPlayerWithId(playerId))
                .findFirst()
                .orElse(null);
    }


    @Override
    public Room getRoomById(String roomId) {
        return findRoomById(roomId).orElseThrow(() -> new ResponseException(ROOM_NOT_FOUND));
    }

    @Override
    public JoinRoomResp getJoinRoomSubscriptionTokens(String roomId, String playerId) {
        // 방과 플레이어의 실재 여부 확인
        Room room = getRoomById(roomId);
        Player player = room.getPlayerWith(playerId);
        return new JoinRoomResp(
                new SubscriptionInfoResp(room),
                new SubscriptionInfoResp(player)
        );
    }

    @Override
    public JoinRandomRoomResp getJoinRandomRoomId(String roomId) {
        return new JoinRandomRoomResp(
                roomId
        );
    }

}