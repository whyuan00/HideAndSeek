package com.ssafy.a410.common.exception;

// 정상적인 경로로 클라이언트의 요청에 의해 발생할 수 없는 예외를 표현하기 위한 클래스
public class UnhandledException extends RuntimeException {
    public UnhandledException(String message) {
        super(message);
    }
}
