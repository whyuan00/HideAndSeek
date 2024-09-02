package com.ssafy.a410.auth.controller.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record SignUpReq (

        @NotBlank(message = "Nickname is required")
        @Size(max = 8, message = "Nickname must be up to 8 characters")
        String nickname,

        @NotBlank(message = "Login ID is required")
        @Pattern(regexp = "^.{4,}$", message = "Login ID must be 4 characters long")
        String loginId,

        @NotBlank(message = "Password is required")
        @Pattern(regexp = "^.{4,}$",
                message = "Password must be at least 4 characters long")
        String password
){
}
