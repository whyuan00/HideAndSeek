package com.ssafy.a410.game.domain.player;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PlayerStatsResp {
        private final String playerId;
        private final String nickname;
        private final int catchCount;
        private final long playTimeInSeconds;
        private final String Team;
}
