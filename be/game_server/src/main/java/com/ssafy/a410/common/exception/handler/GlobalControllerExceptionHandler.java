package com.ssafy.a410.common.exception.handler;

import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.handler.annotation.support.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;

@Slf4j
@ControllerAdvice
public class GlobalControllerExceptionHandler {
    // Controller layer의 validation 실패를 감지하여 처리한다.
    @MessageExceptionHandler
    public void handleControllerValidationException(MethodArgumentNotValidException ex) {
        log.error("Validation failed: {}", ex.getMessage());
    }
}
