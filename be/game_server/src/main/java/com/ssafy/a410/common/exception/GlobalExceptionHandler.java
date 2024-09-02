package com.ssafy.a410.common.exception;

import com.ssafy.a410.game.service.MessageBroadcastService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.security.Principal;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestControllerAdvice
@RequiredArgsConstructor
public class GlobalExceptionHandler {
    private final MessageBroadcastService messageBroadcastService;
    private final SimpMessagingTemplate simpMessagingTemplate;

    @ExceptionHandler(ResponseException.class)
    public ResponseEntity<Map<String, String>> handleResponseException(ResponseException e, Principal principal) {
        ErrorDetail errorDetail = e.getDetail();
        Map<String, String> body = Map.of(
                "detailCode", errorDetail.getDetailCode(),
                "detailMessage", errorDetail.getDetailMessage()
        );
        log.info("ResponseException: {}", errorDetail);
        return ResponseEntity.status(errorDetail.getStatus()).body(body);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationException(MethodArgumentNotValidException e) {
        Map<String, String> errors = e.getBindingResult().getFieldErrors().stream()
                .collect(Collectors.toMap(
                        FieldError::getField,
                        fieldError -> fieldError.getDefaultMessage() != null ? fieldError.getDefaultMessage() : "Invalid value"
                ));

        log.info("ValidationException: {}", errors);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
    }
}
