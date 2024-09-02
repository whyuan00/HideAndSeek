package com.ssafy.a410.room.domain.message.control;

import com.ssafy.a410.common.domain.message.ControlMessage;
import lombok.Getter;

/**
 * 방 관련 제어 메시지
 */
@Getter
public class RoomControlMessage extends ControlMessage {
    public RoomControlMessage(RoomControlType type, Object data) {
        super(type.name(), data, null);
    }
}
