package com.ssafy.a410.game.domain.game.message.control;

import com.ssafy.a410.game.domain.player.Player;
import com.ssafy.a410.game.domain.team.Team;

import java.util.List;

// 조건 없이 모두가 확인할 수 있는 플레이어의 정보
public record PublicPlayerInfo(
        String playerId,
        String playerNickname,
        boolean isDead,
        boolean isBot
) {
    public PublicPlayerInfo(Player player) {
        this(player.getId(), player.getNickname(), false, player.isBot());
    }

    public static List<PublicPlayerInfo> getPublicPlayerInfosOf(Team team) {
        return team.getPlayers().values().stream().map(PublicPlayerInfo::new).toList();
    }
}
