package com.ssafy.a410.game.domain.game.message.control;

import com.ssafy.a410.game.domain.team.Team;

import java.util.List;

public record PublicTeamInfo(
        Team.Character character,
        List<PublicPlayerInfo> players,
        boolean isHidingTeam,
        boolean isSeekingTeam
) {
    public PublicTeamInfo(Team team) {
        this(team.getCharacter(), PublicPlayerInfo.getPublicPlayerInfosOf(team), team.isHidingTeam(), team.isSeekingTeam());
    }
}
