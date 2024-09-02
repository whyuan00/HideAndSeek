package com.ssafy.a410.game.domain.team;

import com.ssafy.a410.common.exception.ResponseException;
import com.ssafy.a410.game.domain.game.Game;
import com.ssafy.a410.game.domain.player.Player;
import com.ssafy.a410.socket.domain.Subscribable;
import lombok.Getter;
import lombok.Setter;

import java.util.HashMap;
import java.util.Map;

import static com.ssafy.a410.common.exception.ErrorDetail.PLAYER_NOT_IN_TEAM;
import static com.ssafy.a410.common.exception.ErrorDetail.TEAM_IS_FULL;

@Getter
public class Team extends Subscribable {
    private static final int MAX_NUM_OF_PLAYERS = 4;
    private final Game game;
    private final Map<String, Player> players;
    @Setter
    private Character character;

    public Team(Character character, Game game) {
        this.character = character;
        this.game = game;
        this.players = new HashMap<>();
    }

    public boolean isEmpty() {
        return players.isEmpty();
    }

    public void addPlayer(Player player) {
        if (this.isFull()) {
            throw new ResponseException(TEAM_IS_FULL);
        }
        players.put(player.getId(), player);
    }

    public void removePlayer(Player player) {
        if (!this.has(player)) {
            throw new ResponseException(PLAYER_NOT_IN_TEAM);
        }
        players.remove(player.getId());
    }

    public void clearPlayers() {
        players.clear();
    }

    public boolean isFull() {
        return players.size() >= MAX_NUM_OF_PLAYERS;
    }

    public boolean isHidingTeam() {
        return this.game.getHidingTeam() == this;
    }

    public boolean isSeekingTeam() {
        return this.game.getSeekingTeam() == this;
    }

    public boolean has(Player player) {
        return players.containsKey(player.getId());
    }

    public void freezePlayers() {
        players.values().forEach(Player::freeze);
    }

    public void unfreezePlayers() {
        players.values().forEach(Player::unfreeze);
    }

    @Override
    public String getTopic() {
        String roomNumber = game.getRoom().getRoomNumber();
        String teamCode = this.character.name().toLowerCase();
        return String.format("/topic/rooms/%s/game/teams/%s", roomNumber, teamCode);
    }

    public Player getPlayerWithId(String playerId) {
        return players.get(playerId);
    }

    public Team getOpponentTeam() {
        return this.isHidingTeam() ? this.game.getSeekingTeam() : this.game.getHidingTeam();
    }
    public boolean isAllPlayerEliminated() {
        return players.values().stream().allMatch(Player::isEliminated);
    }

    public enum Character {
        RACOON, FOX
    }
}
