package com.ssafy.a410.auth.service.jpa;

import com.ssafy.a410.auth.domain.UserProfile;
import com.ssafy.a410.auth.domain.UserRole;
import com.ssafy.a410.auth.model.entity.AuthInfoEntity;
import com.ssafy.a410.auth.model.entity.UserProfileEntity;
import com.ssafy.a410.auth.model.repository.AuthInfoRepository;
import com.ssafy.a410.auth.model.repository.UserProfileRepository;
import com.ssafy.a410.auth.service.AuthService;
import com.ssafy.a410.auth.service.JWTService;
import com.ssafy.a410.auth.service.JWTType;
import com.ssafy.a410.auth.service.UserService;
import com.ssafy.a410.common.constant.MilliSecOf;
import com.ssafy.a410.common.exception.ErrorDetail;
import com.ssafy.a410.common.exception.ResponseException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;

@RequiredArgsConstructor
@Slf4j
@Service
public class JPAAuthService implements AuthService {

    private static final long ACCESS_TOKEN_EXPIRE = MilliSecOf.MONTHS;
    private final JWTService jwtService;
    private final UserService userService;
    private final AuthInfoRepository authInfoRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    private final UserProfileRepository userProfileRepository;

    @Override
    public String getAccessTokenOf(UserProfile userProfile) {
        Map<String, Object> claims = Map.of(
                "uuid", userProfile.getUuid(),
                "role", userProfile.getRole()
        );
        return jwtService.generateToken(JWTType.AUTH_ACCESS, claims, ACCESS_TOKEN_EXPIRE);
    }

    @Override
    public boolean isAuthenticatedUserProfileUuid(String uuid) {
        try {
            return userService.getUserProfileByUuid(uuid) != null;
        } catch (Exception e) {
            log.error("JPAAuthService.isAuthenticatedUserUuid throws not exist UserProfile uuid: {} / {}",
                    uuid, e.getMessage());
            throw e;
        }
    }

    @Override
    public void signup(UserProfile userProfile, String loginId, String rawPassword) {
        if(isDuplicateId(loginId))
            throw new ResponseException(ErrorDetail.DUPLICATE_ID);
        if(isDuplicateNickName(userProfile.getNickname()))
            throw new ResponseException(ErrorDetail.DUPLICATE_NICKNAME);

        UserProfileEntity userProfileEntity = UserProfileEntity.builder()
                .uuid(UUID.randomUUID().toString())  // UUID 자동 생성
                .nickname(userProfile.getNickname())
                .role(UserRole.MEMBER)
                .build();

        userProfileRepository.save(userProfileEntity);

        String salt = BCrypt.gensalt(); // salt 생성
        String hashedPassword = passwordEncoder.encode(rawPassword + salt);

        AuthInfoEntity authInfoEntity = AuthInfoEntity.builder()
                .userProfile(userProfileEntity)
                .loginId(loginId)
                .hashedPassword(hashedPassword)
                .salt(salt)
                .build();

        authInfoRepository.save(authInfoEntity);
    }

    @Override
    public boolean verifyPassword(String rawPassword, String salt, String hashedPassword) {
        String rawPasswordWithSalt = rawPassword + salt;
        if(passwordEncoder.matches(rawPasswordWithSalt, hashedPassword))
            return true;
        else
            throw new ResponseException (ErrorDetail.INVALID_PASSWORD);
    }

    @Override
    public boolean login(String loginId, String rawPassword) {
        AuthInfoEntity authInfoEntity = authInfoRepository.findByLoginId(loginId)
                .orElseThrow(()-> new ResponseException(ErrorDetail.INVALID_LOGIN_ID));
        String salt = authInfoEntity.getSalt();
        String hashedPassword = authInfoEntity.getHashedPassword();

        return verifyPassword(rawPassword, salt, hashedPassword);
    }

    @Override
    public boolean isDuplicateId(String loginId) {
        return authInfoRepository.findByLoginId(loginId).isPresent();
    }

    @Override
    public boolean isDuplicateNickName(String nickName) {
        return userProfileRepository.existsByNickname(nickName);
    }
}
