package com.ssafy.a410.ranking.controller.dto;

public record RankingResp(
        String nickname,
        int wins,
        int catchCount,
        String formattedSurvivalTime
) {}