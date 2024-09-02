package com.ssafy.a410.auth.service.jpa;

import com.ssafy.a410.auth.domain.UserProfile;
import com.ssafy.a410.auth.domain.UserRole;
import com.ssafy.a410.auth.model.entity.AuthInfoEntity;
import com.ssafy.a410.auth.model.entity.UserProfileEntity;
import com.ssafy.a410.auth.model.repository.AuthInfoRepository;
import com.ssafy.a410.auth.model.repository.UserProfileRepository;
import com.ssafy.a410.auth.service.UserService;
import com.ssafy.a410.common.exception.ErrorDetail;
import com.ssafy.a410.common.exception.ResponseException;
import com.ssafy.a410.common.exception.UnhandledException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Random;

@Slf4j
@Service
public class JPAUserService implements UserService {

    private final UserProfileRepository userProfileRepository;
    private final AuthInfoRepository authInfoRepository;

    // 랜덤하게 클라이언트의 이름을 조합하기 위한 단어 목록
    private final List<String> randomNicknamePrefixes;
    private final List<String> randomNicknameSuffixes;
    private final Random random = new Random();

    public JPAUserService(@Value("${guest.nickname.prefix}") String rawNicknamePrefixes,
                          @Value("${guest.nickname.suffix}") String rawNicknameSuffixes,
                          UserProfileRepository userProfileRepository, AuthInfoRepository authInfoRepository) {
        this.userProfileRepository = userProfileRepository;
        this.randomNicknamePrefixes = List.of(rawNicknamePrefixes.split(" "));
        this.randomNicknameSuffixes = List.of(rawNicknameSuffixes.split(" "));
        this.authInfoRepository = authInfoRepository;
    }

    @Override
    public UserProfile getUserProfileByUuid(String uuid) {
        UserProfileEntity userProfile = userProfileRepository.findByUuid(uuid)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return UserProfile.fromEntity(userProfile);
    }

    @Override
    public UserProfile getUserProfileByLoginId(String loginId) {
        AuthInfoEntity authInfoEntity = authInfoRepository.findByLoginId(loginId)
                .orElseThrow(() -> new ResponseException(ErrorDetail.INVALID_LOGIN_ID));
        UserProfileEntity userProfileEntity = authInfoEntity.getUserProfile();
        return UserProfile.fromEntity(userProfileEntity);
    }

    @Override
    public UserProfileEntity getUserProfileEntityByUuid(String uuid) {
        return userProfileRepository.findByUuid(uuid).orElseThrow(() -> new ResponseException(ErrorDetail.PLAYER_NOT_FOUND));
    }

    @Override
    public UserProfile createGuestUserProfile() {
        // 랜덤하게 닉네임을 만들어서
        UserProfileEntity requestEntity = getGuestProfileRequestEntity();
        return UserProfile.fromEntity(userProfileRepository.save(requestEntity));
    }

    // 랜덤한 닉네임을 가지는 게스트 사용자 프로필 생성 요청 엔티티를 생성
    private UserProfileEntity getGuestProfileRequestEntity() {
        return UserProfileEntity.builder()
                .nickname(generateUniqueRandomNickname())
                .uuid(java.util.UUID.randomUUID().toString())
                .role(UserRole.GUEST)
                .build();
    }

    // 랜덤하며, 중복되지 않는 닉네임을 생성
    @Override
    public String generateUniqueRandomNickname() {
        final int MAX_TRIALS = 10;
        for (int trial = 0; trial < MAX_TRIALS; trial++) {
            String nickname = generateRandomNickname();
            if (!userProfileRepository.existsByNickname(nickname)) {
                return nickname;
            }
        }
        // WARNING : 조회와 삽입 사이에서 동시성 문제가 발생할 수 있음
        throw new UnhandledException("Failed to generate a unique random nickname");
    }

    @Override
    public boolean isExistUserProfile(String uuid) {
        return userProfileRepository.existsByUuid(uuid);
    }

    @Override
    public void updateUserProfile(UserProfile userProfile) {
        UserProfileEntity entity = UserProfile.toEntity(userProfile);
        UserProfileEntity savedEntity = userProfileRepository.save(entity);
        UserProfile.fromEntity(savedEntity);
    }

    @Override
    public void updateUserProfileEntity(UserProfileEntity userProfileEntity) {
        userProfileRepository.save(userProfileEntity);
    }

    // 랜덤 닉네임을 생성
    public String generateRandomNickname() {
        String prefix = randomNicknamePrefixes.get(random.nextInt(randomNicknamePrefixes.size()));
        String suffix = randomNicknameSuffixes.get(random.nextInt(randomNicknameSuffixes.size()));
        return prefix + " " + suffix;
    }
}
