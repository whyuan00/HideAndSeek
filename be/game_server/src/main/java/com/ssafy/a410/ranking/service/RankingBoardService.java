package com.ssafy.a410.ranking.service;

import com.ssafy.a410.auth.model.entity.UserProfileEntity;
import com.ssafy.a410.auth.model.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RankingBoardService implements RankingService{

    private final UserProfileRepository userProfileRepository;

    @Override
    public List<UserProfileEntity> getAllUsersSortedByWins() {
        return userProfileRepository.findAll(Sort.by(Sort.Direction.DESC, "wins"));
    }

    @Override
    public List<UserProfileEntity> getAllUsersSortedByCatchCount() {
        return userProfileRepository.findAll(Sort.by(Sort.Direction.DESC, "catchCount"));
    }

    @Override
    public List<UserProfileEntity> getAllUsersSortedBySurvivalTime() {
        return userProfileRepository.findAll(Sort.by(Sort.Direction.DESC, "survivalTimeInSeconds"));
    }
}
