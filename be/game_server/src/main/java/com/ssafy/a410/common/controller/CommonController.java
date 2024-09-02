package com.ssafy.a410.common.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

@Slf4j
@RestController
public class CommonController {
    @RequestMapping("/")
    public String getServerTime() {
        LocalDateTime now = LocalDateTime.now();
        return now.toString();
    }
}
