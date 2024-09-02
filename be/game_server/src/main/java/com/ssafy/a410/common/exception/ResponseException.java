package com.ssafy.a410.common.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Getter
public class ResponseException extends RuntimeException {
    private final ErrorDetail detail;
}
