import { getRoomRepository } from "./index";

// 플레이어의 탈락 사유
export class PLAYER_ELIMINATION_REASON {
    // Main Phase에 상대 편에게 잡혔을 때
    static CAUGHT = "CAUGHT";
    // Ready Phase에 숨지 못했을 때
    static FAILED_TO_HIDE = "FAILED_TO_HIDE";
    // End Phase에 금지 구역에 포함되어 있을 때
    static OUT_OF_SAFE_ZONE = "OUT_OF_SAFE_ZONE";
    // 무단 이탈
    static PLAYER_DISCONNECTED = "PLAYER_DISCONNECTED";
}

export class Player {
    #playerId;
    #playerNickname;
    #team;
    #isBot;
    #isReady;
    #isDead;
    #restSeekCount; // 남은 찾기 횟수
    #catchCount; // 잡은 횟수
    #x;
    #y;
    #direction;
    #sprite;
    #isHiding = false;

    static MAX_SEEK_COUNT = 5;

    constructor({ playerId, playerNickname, isReady, isBot, team }) {
        this.#playerId = playerId;
        this.#playerNickname = playerNickname;
        this.#team = team;
        this.#isBot = isBot;
        this.#isReady = isReady;
        this.#isDead = false;
        this.#restSeekCount = 5;
        this.#catchCount = 0;
    }

    getPlayerId() {
        return this.#playerId;
    }

    getPlayerNickname() {
        return this.#playerNickname;
    }

    getIsBot() {
        return this.#isBot;
    }

    getIsReady() {
        return this.#isReady;
    }

    setIsReady(isReady) {
        this.#isReady = isReady;
    }

    setDead() {
        this.#isDead = true;
    }

    isDead() {
        return this.#isDead;
    }

    async isRacoonTeam() {
        return (await this.getTeam()).getCharacter().toLowerCase() === "racoon";
    }

    async isFoxTeam() {
        return (await this.getTeam()).getCharacter().toLowerCase() === "fox";
    }

    setPosition({ x, y, direction }) {
        this.#x = x;
        this.#y = y;
        this.#direction = direction;
    }

    getPosition() {
        return { x: this.#x, y: this.#y, direction: this.#direction };
    }

    setTeam(team) {
        this.#team = team;
    }

    getTeam() {
        if (this.#team) {
            return Promise.resolve(this.#team);
        } else {
            const interval = setInterval(() => {
                if (this.#team) {
                    clearInterval(interval);
                    return Promise.resolve(this.#team);
                }
            }, 100);
        }
    }

    isInitialized() {
        return (
            this.#x !== undefined &&
            this.#y !== undefined &&
            this.#direction !== undefined
        );
    }

    async isHidingTeam() {
        return (await this.getTeam()).isHidingTeam();
    }

    async isSeekingTeam() {
        return (await this.getTeam()).isSeekingTeam();
    }

    getRestSeekCount() {
        return this.#restSeekCount;
    }

    setRestSeekCount(restSeekCount) {
        this.#restSeekCount = restSeekCount;
    }

    getCatchCount() {
        return this.#catchCount;
    }

    increaseCatchCount() {
        this.#catchCount++;
    }

    canSeek() {
        return this.#restSeekCount > 0;
    }

    setSprite(sprite) {
        this.#sprite = sprite;
    }

    getSprite() {
        if (this.#sprite) {
            return Promise.resolve(this.#sprite);
        } else {
            return new Promise((resolve) => {
                const interval = setInterval(() => {
                    if (this.#sprite) {
                        clearInterval(interval);
                        resolve(this.#sprite);
                    }
                }, 10);
            });
        }
    }

    setIsHiding(isHiding) {
        this.#isHiding = isHiding;
    }

    isHiding() {
        return this.#isHiding;
    }
}

export class Team {
    // "FOX" || "RACOON"
    #character;
    #isHidingTeam;
    #isSeekingTeam;
    #players = [];

    constructor({ character, isHidingTeam, isSeekingTeam, players }) {
        this.#character = character;
        this.#isHidingTeam = isHidingTeam;
        this.#isSeekingTeam = isSeekingTeam;

        const roomRepository = getRoomRepository();
        for (const _player of players) {
            const playerInRoom = roomRepository.getPlayerWithId(
                _player.playerId
            );
            let player;

            // 대기실에 없던 플레이어인 경우 (봇)
            if (!playerInRoom) {
                player = new Player({ ..._player, team: this });
                // 방에 추가
                roomRepository.addPlayer(player);
            } else {
                player = playerInRoom;
            }
            this.#players.push(player);
            player.setTeam(this);
        }
    }

    getCharacter() {
        return this.#character;
    }

    isHidingTeam() {
        return this.#isHidingTeam;
    }

    setIsHidingTeam(isHidingTeam) {
        this.#isHidingTeam = isHidingTeam;
        this.#isSeekingTeam = !isHidingTeam;
    }

    isSeekingTeam() {
        return this.#isSeekingTeam;
    }

    setIsSeekingTeam(isSeekingTeam) {
        this.#isSeekingTeam = isSeekingTeam;
        this.#isHidingTeam = !isSeekingTeam;
    }

    getPlayers() {
        return this.#players;
    }

    addPlayer(player) {
        player.setTeam(this);
        this.#players.push(player);
    }

    isFoxTeam() {
        return this.#character.toLowerCase() === "fox";
    }

    isRacoonTeam() {
        return this.#character.toLowerCase() === "racoon";
    }

    getPlayerWithId(playerId) {
        return this.#players.find(
            (player) => player.getPlayerId() === playerId
        );
    }
}
