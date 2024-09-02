package com.ssafy.a410.room.service;

import com.ssafy.a410.auth.domain.UserProfile;
import com.ssafy.a410.game.domain.player.Player;
import com.ssafy.a410.room.controller.dto.JoinRandomRoomResp;
import com.ssafy.a410.room.controller.dto.JoinRoomResp;
import com.ssafy.a410.room.domain.Room;

import java.util.List;
import java.util.Optional;

// 방의 운영
public interface RoomService {
    Room createRoom(String userProfileUuid, String password);

    Player joinRoom(Room room, UserProfile userProfile);

    Player joinRoomWithPassword(String roomId, String userProfileUuid, String password);

    void leaveRoom(Room room, Player player);

    void setPlayerReady(Room room, Player player);

    void setPlayerReady(String roomId, String userProfileUuid);

    Optional<Room> findRoomById(String roomId);

    Room getRoomById(String roomId);

    JoinRoomResp getJoinRoomSubscriptionTokens(String roomId, String playerId);

    JoinRandomRoomResp getJoinRandomRoomId(String roomId);

    Optional<Room> findRoomByPlayerId(String playerId);

    void removeRoom(String roomId);

    List<Room> findAvailableRooms();

    Room getRoomHasDisconnectedPlayerInfoWithId(String playerId);
}
