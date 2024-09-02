package com.ssafy.a410.auth.domain;

import com.ssafy.a410.auth.model.entity.UserProfileEntity;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@AllArgsConstructor
public class UserProfile {
    private int id;
    private String uuid;

    @Setter
    private String nickname;
    private UserRole role;

    public static UserProfile fromEntity(UserProfileEntity entity) {
        return new UserProfile(entity.getId(), entity.getUuid(), entity.getNickname(), entity.getRole());
    }
    public static UserProfileEntity toEntity(UserProfile profile) {
        return UserProfileEntity.builder()
                .id(profile.getId())
                .uuid(profile.getUuid())
                .nickname(profile.getNickname())
                .role(profile.getRole())
                .build();
    }
}
