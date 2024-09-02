package com.ssafy.a410.ranking.controller;

import com.ssafy.a410.auth.model.entity.UserProfileEntity;
import com.ssafy.a410.auth.service.jpa.JPAUserService;
import com.ssafy.a410.ranking.controller.dto.RankingResp;
import com.ssafy.a410.ranking.service.RankingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/rankings")
@RequiredArgsConstructor
public class RankingController {

    private final RankingService rankingService;
    private final JPAUserService jpaUserService;
    @GetMapping("/wins")
    public List<RankingResp> getRankingByWins() {
        return rankingService.getAllUsersSortedByWins().stream()
                .map(user -> new RankingResp(
                        user.getNickname(),
                        user.getWins(),
                        user.getCatchCount(),
                        user.getFormattedSurvivalTime()))
                .toList();
    }

    @GetMapping("/catch-count")
    public List<RankingResp> getRankingByCatchCount() {
        return rankingService.getAllUsersSortedByCatchCount().stream()
                .map(user -> new RankingResp(
                        user.getNickname(),
                        user.getWins(),
                        user.getCatchCount(),
                        user.getFormattedSurvivalTime()))
                .toList();
    }

    @GetMapping("/survival-time")
    public List<RankingResp> getRankingBySurvivalTime() {
        return rankingService.getAllUsersSortedBySurvivalTime().stream()
                .map(user -> new RankingResp(
                        user.getNickname(),
                        user.getWins(),
                        user.getCatchCount(),
                        user.getFormattedSurvivalTime()))
                .toList();
    }

    @GetMapping("/me")
    public RankingResp getMyRanking(Principal principal) {
        // 현재 사용자의 ID를 가져옴
        String userId = principal.getName();
        UserProfileEntity userProfile = jpaUserService.getUserProfileEntityByUuid(userId);

        return new RankingResp(
                userProfile.getNickname(),
                userProfile.getWins(),
                userProfile.getCatchCount(),
                userProfile.getFormattedSurvivalTime()
        );
    }
}
