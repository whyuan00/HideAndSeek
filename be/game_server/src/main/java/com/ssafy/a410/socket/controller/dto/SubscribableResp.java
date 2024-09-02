package com.ssafy.a410.socket.controller.dto;

import com.ssafy.a410.socket.domain.Subscribable;
import lombok.Getter;

@Getter
public class SubscribableResp<T extends Subscribable> {
    private final T data;
    private final String topic;

    public SubscribableResp(T data) {
        this.data = data;
        this.topic = data.getTopic();
    }
}
