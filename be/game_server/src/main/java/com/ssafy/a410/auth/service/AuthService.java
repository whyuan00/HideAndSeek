package com.ssafy.a410.auth.service;

import com.ssafy.a410.auth.domain.UserProfile;

public interface AuthService {
    String getAccessTokenOf(UserProfile userProfile);

    boolean isAuthenticatedUserProfileUuid(String uuid);

    void signup(UserProfile userProfile, String loginId, String rawPassword);
    boolean verifyPassword(String rawPassword, String salt, String hashedPassword);
    boolean login(String loginId, String rawPassword);

    boolean isDuplicateId(String loginId);
    boolean isDuplicateNickName(String nickName);
}
