import axios from "../network/AxiosClient";
import asyncResponses from "../repository/_asyncResponses";

import EventBus from "../game/EventBus";
import { getStompClient } from "../network/StompClient";
import GameRepository from "./_game";
import { Player } from "./interface";

// 플레이어의 방 입장 이벤트
const PLAYER_JOIN = "PLAYER_JOIN";
// 플레이어의 레디 이벤트
const PLAYER_READY = "PLAYER_READY";
// 게임이 시작되어 구독을 시작하는 이벤트
const SUBSCRIBE_GAME = "SUBSCRIBE_GAME";

// 플레이어의 게임 시작 위치 수신
const INITIALIZE_PLAYER = "INITIALIZE_PLAYER";
// 플레이어의 탐색 요청 성공
const INTERACT_SEEK_SUCCESS = "INTERACT_SEEK_SUCCESS";
// 플레이어의 탐색 요청 실패
const INTERACT_SEEK_FAIL = "INTERACT_SEEK_FAIL";
// 플레이어의 숨기 요청 성공
const INTERACT_HIDE_SUCCESS = "INTERACT_HIDE_SUCCESS";
// 플레이어의 숨기 요청 실패
const INTERACT_HIDE_FAIL = "INTERACT_HIDE_FAIL";
// 방향 힌트 이벤트 수신
const DIRECTION_HINT = "DIRECTION_HINT";

// 사용자가 현재 참여하고 있는 방에 대한 정보를 담는 레포지토리
export default class RoomRepository {
    #roomNumber;
    #roomPassword;
    #stompClient;
    #joinedPlayers = [];
    #gameRepository;
    #gameStartsAt;
    #directionHints = [];

    #joinedPlayerIntervalId;

    #isInitialized = false;

    constructor(roomNumber, roomPassword) {
        this.#roomNumber = roomNumber;
        this.#roomPassword = roomPassword;
        this.#gameRepository = null;
        this.#gameStartsAt = null;

        const initializationTrial = setInterval(() => {
            getStompClient()
                .then((client) => {
                    clearInterval(initializationTrial);
                    this.#stompClient = client;
                    this.#startPlayerListInterval();
                })
                .catch((e) => {});
        }, 10);
    }

    startSubscribeRoom(roomSubscriptionInfo) {
        const trial = setInterval(() => {
            if (this.#stompClient) {
                clearInterval(trial);
                this.#stompClient.subscribe(
                    roomSubscriptionInfo,
                    async (stompMessage) => {
                        const message = JSON.parse(stompMessage.body);
                        this.#handleRoomMessage(message);
                    }
                );
            }
        }, 100);
    }

    startSubscribePlayer(playerSubscriptionInfo) {
        const trial = setInterval(() => {
            if (this.#stompClient) {
                clearInterval(trial);
                this.#stompClient.subscribe(
                    playerSubscriptionInfo,
                    async (stompMessage) => {
                        const message = JSON.parse(stompMessage.body);
                        this.#handlePlayerMessage(message);
                    }
                );
            }
        });
    }

    clear() {
        this.#endSubscribe();
    }

    #endSubscribe() {
        clearInterval(this.#joinedPlayerIntervalId);
    }

    #startPlayerListInterval() {
        const UPDATE_INTERVAL = 500;

        this.#joinedPlayerIntervalId = setInterval(async () => {
            axios
                .get(`/api/rooms/${this.#roomNumber}/joined-players`)
                .then((resp) => {
                    const { joinedPlayers } = resp.data;
                    this.#updatePlayers(joinedPlayers);
                })
                .catch((error) => {
                    clearInterval(this.#joinedPlayerIntervalId);
                });
        }, UPDATE_INTERVAL);
    }

    #handleRoomMessage(message) {
        const { type, data } = message;
        switch (type) {
            case SUBSCRIBE_GAME:
                this.#handleSubscribeGameEvent(data);
                break;
        }
    }

    async #handlePlayerMessage(message) {
        const { type, data, requestId } = message;
        const result = { type, data };

        // 초기화 이벤트가 아닌 경우, 초기화가 완료될 때까지 대기
        if (!this.#isInitialized && type !== INITIALIZE_PLAYER) {
            while (!this.#isInitialized) {
                await new Promise((resolve) => setTimeout(resolve, 100));
            }
        }
        // publish로 응답 받고 싶을 경우 여기서 코드 추가해서 받아와야함
        switch (type) {
            // 초기화 수행 후
            case INITIALIZE_PLAYER:
                this.#handleInitializePlayerEvent(requestId, result);
                break;
            case INTERACT_HIDE_SUCCESS:
                this.#handleHideRequestSuccessEvent(requestId, result);
                break;
            case INTERACT_HIDE_FAIL:
                this.#handleHideRequestFailedEvent(requestId, result);
                break;
            case INTERACT_SEEK_SUCCESS:
                this.#handleSeekRequestSuccessEvent(requestId, result);
                break;
            case INTERACT_SEEK_FAIL:
                this.#handleSeekRequestFailedEvent(requestId, result);
                break;
            case DIRECTION_HINT:
                this.#handleDirectionHintEvent(requestId, result);
                break;
            case "ITEM_APPLIED_TO_PLAYER":
                this.handleItemApplyToPlayer(requestId, result);
                break;
            case "ITEM_APPLIED_TO_OBJECT":
                this.handleItemApplyToObject(requestId, result);
                break;
            case "ITEM_CLEARED":
                break;
        }
    }

    handleItemApplyToPlayer(requestId, result) {
        asyncResponses.set(requestId, result);
    }

    handleItemApplyToObject(requestId, result) {
        asyncResponses.set(requestId, result);
    }

    // 주기적으로 수신한 플레이어 정보와 현재 플레이어 정보를 대조하여 상태를 업데이트
    #updatePlayers(joinedPlayers) {
        // 업데이트 후에도 방에 여전히 남아 있는 사용자들을 저장
        const remainPlayerIds = [];

        // 새로 들어온 사용자들에 대해
        for (let playerData of joinedPlayers) {
            // 방에 없던 사용자면
            if (!this.containsPlayerWithId(playerData.playerId)) {
                // 새 플레이어로 추가
                const player = new Player({ ...playerData });
                this.#joinedPlayers.push(player);
                remainPlayerIds.push(player.getPlayerId());
            } else {
                // 있던 사용자면 레디 상태 업데이트
                const targetPlayer = this.#joinedPlayers.find(
                    (player) => player.getPlayerId() === playerData.playerId
                );
                if (targetPlayer.getIsReady() !== playerData.isReady) {
                    EventBus.emit("player-ready-status-changed");
                }
                targetPlayer.setIsReady(playerData.isReady);
                remainPlayerIds.push(targetPlayer.getPlayerId());
            }
        }

        // 방에 남아 있는 사용자들에 대해, 새로 온 정보 안에 포함되어 있지 않으면 제거
        this.#joinedPlayers = this.#joinedPlayers.filter((player) =>
            remainPlayerIds.includes(player.getPlayerId())
        );
    }

    containsPlayerWithId(targetPlayerId) {
        return this.#joinedPlayers.some(
            (player) => player.getPlayerId() === targetPlayerId
        );
    }

    #handleSubscribeGameEvent(data) {
        const { subscriptionInfo, startsAfterMilliSec } = data;
        this.#gameRepository = new GameRepository(
            this,
            this.#roomNumber,
            subscriptionInfo,
            startsAfterMilliSec
        );

        this.#setGameStartsAt(startsAfterMilliSec);
    }

    #handleInitializePlayerEvent(requestId, result) {
        this.#gameRepository.initializePlayer(result.data);
        asyncResponses.set(requestId, result);
        this.#isInitialized = true;
    }

    #handleHideRequestSuccessEvent(requestId, result) {
        asyncResponses.set(requestId, result);
    }

    #handleHideRequestFailedEvent(requestId, result) {
        asyncResponses.set(requestId, result);
    }

    #handleSeekRequestSuccessEvent(requestId, result) {
        asyncResponses.set(requestId, result);
    }

    #handleSeekRequestFailedEvent(requestId, result) {
        asyncResponses.set(requestId, result);
    }
    #handleDirectionHintEvent(requestId, result) {
        this.#directionHints = result.data.directions;
    }

    getDirectionHints() {
        return this.#directionHints;
    }

    setDirectionHints() {
        this.#directionHints = [];
    }

    // 방 번호 반환
    getRoomNumber() {
        return this.#roomNumber;
    }

    // 방 비밀번호 반환
    getRoomPassword() {
        return this.#roomPassword;
    }

    // 방에 참가해 있는 사용자 정보 반환
    // 단, 인게임이 아닌 방에 관련된 정보만 사용해야 한다.
    getJoinedPlayers() {
        return this.#joinedPlayers;
    }

    getPlayerWithId(playerId) {
        return this.#joinedPlayers.find(
            (player) => player.getPlayerId() === playerId
        );
    }

    addPlayer(player) {
        this.#joinedPlayers.push(player);
    }

    // 게임 정보를 담고 있는 repository 반환
    // WARNING : 게임 정보 구독 요청이 처리될 때까지는 null을 반환한다.
    getGameRepository() {
        if (this.#gameRepository) {
            return Promise.resolve(this.#gameRepository);
        } else {
            return new Promise((resolve, reject) => {
                const trial = setInterval(() => {
                    if (this.#gameRepository) {
                        clearInterval(trial);
                        resolve(this.#gameRepository);
                    }
                }, 10);
            });
        }
    }

    // 게임 시작 여부 반환
    getGameStartsAt() {
        return this.#gameStartsAt;
    }

    // 게임 시작 시간 설정
    #setGameStartsAt(startsAfterMilliSec) {
        this.#gameStartsAt = Date.now() + startsAfterMilliSec;
    }
}
