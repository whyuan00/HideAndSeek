package com.ssafy.a410.game.domain.game.message.control;

import com.ssafy.a410.game.domain.game.Game;
import com.ssafy.a410.game.domain.game.Phase;

// 게임에 대한 정보를 담는 DTO로, 팀과 상관 없이 모두가 확인할 수 있는 정보를 담는다.
public record GameInfo(
        String roomNumber,
        Phase currentPhase,
        PublicTeamInfo racoonTeam,
        PublicTeamInfo foxTeam,
        String requestId
) {
    public GameInfo(Game game) {
        this(game, null);
    }

    public GameInfo(Game game, String requestId) {
        this(game.getRoom().getRoomNumber(), game.getCurrentPhase(),
                new PublicTeamInfo(game.getRacoonTeam()), new PublicTeamInfo(game.getFoxTeam()), requestId);
    }
}
