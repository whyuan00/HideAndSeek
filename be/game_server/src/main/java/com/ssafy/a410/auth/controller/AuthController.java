package com.ssafy.a410.auth.controller;

import com.ssafy.a410.auth.controller.dto.*;
import com.ssafy.a410.auth.domain.UserProfile;
import com.ssafy.a410.auth.domain.UserRole;
import com.ssafy.a410.auth.filter.HTTPJWTAuthFilter;
import com.ssafy.a410.auth.service.AuthService;
import com.ssafy.a410.auth.service.JWTService;
import com.ssafy.a410.auth.service.JWTType;
import com.ssafy.a410.auth.service.UserService;
import com.ssafy.a410.common.constant.MilliSecOf;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;
import java.util.UUID;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserService userService;
    private final AuthService authService;
    private final JWTService jwtService;

    /**
     * 게스트 사용자가 사용할 닉네임을 전달 받아, 생성된 게스트 사용자 정보와 Access Token을 반환한다.
     * 반환된 Access Token은 WebSocket handshake 과정에서 HTTP header에 포함되어야 한다.
     *
     * @see HTTPJWTAuthFilter
     */
    @PostMapping("/guest/sign-up")
    public GuestSignUpResp guestSignUp() {
        UserProfile guestUserProfile = userService.createGuestUserProfile();
        String accessToken = authService.getAccessTokenOf(guestUserProfile);
        String webSocketConnectionToken = jwtService.generateToken(JWTType.WEBSOCKET_CONNECTION, Map.of("userProfileUuid", guestUserProfile.getUuid()), 10L * MilliSecOf.HOURS);
        return new GuestSignUpResp(accessToken, new UserProfileResp(guestUserProfile), webSocketConnectionToken);
    }

    /**
     * UserId가 생성되어있지 않은 시점이기때문에, request를 0으로 선처리 하고 SignUp시 id를 할당하는 방법을 사용하려고 함.
     */
    @PostMapping("/sign-up")
    public SignUpResp signup(@Valid @RequestBody SignUpReq request) {
        UserProfile userProfile = new UserProfile(
                0, UUID.randomUUID().toString(), request.nickname(), UserRole.MEMBER
        );
        authService.signup(userProfile, request.loginId(), request.password());
        return new SignUpResp(new UserProfileResp(userProfile));
    }

    /**
     * 사용자가 전달한 정보로 로그인을 처리하고, 성공 시 Access Token을 반환한다.
     */
    @PostMapping("/login")
    public LoginResp login(@RequestBody LoginReq loginReq) {
        authService.login(loginReq.loginId(), loginReq.password());
            UserProfile userProfile = userService.getUserProfileByLoginId(loginReq.loginId());
            String accessToken = authService.getAccessTokenOf(userProfile);
            String webSocketConnectionToken = jwtService.generateToken(JWTType.WEBSOCKET_CONNECTION, Map.of("userProfileUuid", userProfile.getUuid()), 10L * MilliSecOf.HOURS);
            return new LoginResp(accessToken, new UserProfileResp(userProfile), webSocketConnectionToken);
    }

    /**
     * 닉네임 수정
     */
    @PutMapping("/update/nick-name")
    public UserProfileResp updateNickName(@Valid @RequestBody UpdateNickNameReq updateNickNameReq, Principal principal) {
        String userId = principal.getName();
        UserProfile userProfile = userService.getUserProfileByUuid(userId);
        userProfile.setNickname(updateNickNameReq.nickname());
        userService.updateUserProfile(userProfile);
        return new UserProfileResp(userProfile);
    }
}
