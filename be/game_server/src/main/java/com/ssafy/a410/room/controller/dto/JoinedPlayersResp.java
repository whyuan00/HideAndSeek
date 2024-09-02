package com.ssafy.a410.room.controller.dto;

import com.ssafy.a410.game.domain.player.Player;
import lombok.Getter;

import java.util.ArrayList;
import java.util.List;

@Getter
public class JoinedPlayersResp {
    private final List<JoinedPlayer> joinedPlayers;

    public JoinedPlayersResp() {
        this.joinedPlayers = new ArrayList<>();
    }

    public void addPlayer(Player player) {
        joinedPlayers.add(new JoinedPlayer(player.getId(), player.getNickname(), player.isReadyToStart()));
    }

    record JoinedPlayer(String playerId, String playerNickname, boolean isReady) {
    }
}
