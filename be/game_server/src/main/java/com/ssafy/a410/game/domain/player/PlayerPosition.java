package com.ssafy.a410.game.domain.player;

import com.ssafy.a410.game.controller.dto.PlayerPositionReq;

public record PlayerPosition(
        String playerId,
        double x,
        double y,
        String direction
) {
    public PlayerPosition(Player player) {
        this(player.getId(), player.getPos().getX(), player.getPos().getY(), player.getDirection().name());
    }

    public PlayerPosition(String playerId, PlayerPositionReq req) {
        this(playerId, req.x(), req.y(), req.direction());
    }
}
