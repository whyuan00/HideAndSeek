package com.ssafy.a410.ranking.service;

import com.ssafy.a410.auth.model.entity.UserProfileEntity;

import java.util.List;

public interface RankingService {
    List<UserProfileEntity> getAllUsersSortedByWins();
    List<UserProfileEntity> getAllUsersSortedByCatchCount();
    List<UserProfileEntity> getAllUsersSortedBySurvivalTime();
}
