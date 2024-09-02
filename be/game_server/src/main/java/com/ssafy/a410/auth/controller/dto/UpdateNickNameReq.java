package com.ssafy.a410.auth.controller.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateNickNameReq(

        @NotBlank(message = "Nickname is required")
        @Size(max = 8, message = "Nickname must be up to 8 characters")
        String nickname
) {
}
