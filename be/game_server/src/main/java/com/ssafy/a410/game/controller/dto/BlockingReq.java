package com.ssafy.a410.game.controller.dto;

import lombok.Data;

@Data
public class BlockingReq<T> {
    private String requestId;
    private T data;
}
