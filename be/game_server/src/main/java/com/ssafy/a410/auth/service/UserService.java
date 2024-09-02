package com.ssafy.a410.auth.service;

import com.ssafy.a410.auth.domain.UserProfile;
import com.ssafy.a410.auth.model.entity.UserProfileEntity;

public interface UserService {

    UserProfile getUserProfileByUuid(String uuid);

    UserProfile getUserProfileByLoginId(String loginId);

    UserProfileEntity getUserProfileEntityByUuid(String uuid);

    UserProfile createGuestUserProfile();

    String generateUniqueRandomNickname();

    boolean isExistUserProfile(String uuid);

    void updateUserProfile(UserProfile userProfile);

    void updateUserProfileEntity(UserProfileEntity userProfileEntity);

}
