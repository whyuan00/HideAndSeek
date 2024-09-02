package com.ssafy.a410.room.controller.dto;

import com.ssafy.a410.room.domain.Room;
import com.ssafy.a410.socket.domain.Subscribable;
import lombok.Getter;

@Getter
public class RoomResp extends Subscribable {
    private final String roomNumber;

    public RoomResp(Room room) {
        this.roomNumber = room.getRoomNumber();
    }

    @Override
    public String getTopic() {
        return "/topic/rooms/" + roomNumber;
    }

    @Override
    public String getSubscriptionToken() {
        return null;
    }

    @Override
    public boolean isCorrectSubscriptionToken(String token) {
        return false;
    }
}
