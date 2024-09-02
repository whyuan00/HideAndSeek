import { v4 as uuid } from "uuid";

import { getStompClient } from "../network/StompClient";
import { Team, Player, PLAYER_ELIMINATION_REASON } from "./interface";
import asyncResponses from "./_asyncResponses";
import { Mutex } from "async-mutex";
import uiControlQueue from "../util/UIControlQueue";

// 게임 시작 이벤트
const GAME_START = "GAME_START";
// 게임 정보 전달 이벤트
const GAME_INFO = "GAME_INFO";
// 라운드 전환 이벤트
const ROUND_CHANGE = "ROUND_CHANGE";
// 페이즈 전환 이벤트
const PHASE_CHANGE = "PHASE_CHANGE";
// 게임 종료 이벤트
const GAME_END = "GAME_END";
// 숨기 성공 이벤트
const INTERACT_HIDE_SUCCESS = "INTERACT_HIDE_SUCCESS";
// 숨기 실패 이벤트
const INTERACT_HIDE_FAIL = "INTERACT_HIDE_FAIL";
// 찾기 성공 이벤트
const INTERACT_SEEK_SUCCESS = "INTERACT_SEEK_SUCCESS";
// 찾기 실패 이벤트
const INTERACT_SEEK_FAIL = "INTERACT_SEEK_FAIL";
// 플레이어가 숨지 못했을 때 탈락 이벤트
const FAILED_TO_HIDE = "FAILED_TO_HIDE";
// 플레이어 게임 이탈 이벤트
const PLAYER_DISCONNECTED = "PLAYER_DISCONNECTED";
// 안전 구역 업데이트 이벤트
const SAFE_ZONE_UPDATE = "SAFE_ZONE_UPDATE";
// 안전구역밖으로 나간 플레이어 게임 탈락 이벤트
const ELIMINATION_OUT_OF_SAFE_ZONE = "ELIMINATION_OUT_OF_SAFE_ZONE";
// 게임 종료 시 게임 결과 수신 이벤트
const GAME_RESULT = "GAME_RESULT";

// 화면 가리기 명령 이벤트
const COVER_SCREEN = "COVER_SCREEN";
// 화면 가리기 해제 명령 이벤트
const UNCOVER_SCREEN = "UNCOVER_SCREEN";
// 위치 공유 이벤트
const SHARE_POSITION = "SHARE_POSITION";
// 플레이어 조작 불가 명령 이벤트
const FREEZE = "FREEZE";
// 플레이어 조작 불가 해제 명령 이벤트
const UNFREEZE = "UNFREEZE";

// 게임 상태의 초기화를 보장하기 위한 뮤텍스
const gameInitializationMutex = new Mutex();

export class Phase {
    // 게임을 초기화 하고 있는 상태
    static INITIALIZING = "INITIALIZING";
    // 초기화가 완료된 상태
    static INITIALIZED = "INITIALIZED";
    // 숨는 팀이 숨을 곳을 찾고 있는 상태
    static READY = "READY";
    // 찾는 팀이 숨은 팀을 찾고 있는 상태
    static MAIN = "MAIN";
    // 다음 라운드를 위해 기존의 게임 상태를 정리하고 있는 상태
    static END = "END";
    // 게임이 끝난 상태
    static GAME_END = "GAME_END";
}

export default class GameRepository {
    #room;
    #roomNumber;
    #stompClient;
    #startedAt;
    #currentPhase;
    #foxTeam;
    #racoonTeam;
    #me;
    #nextPhaseChangeAt;
    #currentPhaseFinishAfterMilliSec;
    #currentSafeZone;
    #isGameEnd = false;
    #winningTeam;
    #gameResultFlag = false;

    #isInitialized = false;
    #currentEliminatedPlayerAndTeam; //ui업데이트
    #initialItems;
    #itemQ;
    #itemW;
    #itemSpeed = 200; // 현재의 아이템 스피드
    #gameResults = [];
    #isMushroomUsed = false;
    #isPoisonMushroomUsed = false;

    #seekFailCatchCount = 0; // 기본값 0
    #itemAppliedFromObject; // 현재 적용중인 아이템 내용

    #itemQapplied = false; // 아이템 사용시 true로 바꾸고 x이미지 추가
    #itemWapplied = false; 

    constructor(room, roomNumber, gameSubscriptionInfo, startsAfterMilliSec) {
        this.#room = room;
        this.#roomNumber = roomNumber;

        const initializationTrial = setInterval(() => {
            getStompClient()
                .then((client) => {
                    clearInterval(initializationTrial);
                    this.#stompClient = client;
                    this.startSubscribeGame(gameSubscriptionInfo);
                })
                .catch((e) => {});
        }, 10);
    }

    startSubscribeGame(gameSubscriptionInfo) {
        this.#stompClient.subscribe(
            gameSubscriptionInfo,
            async (stompMessage) => {
                const message = JSON.parse(stompMessage.body);
                this.#handleGameMessage(message);
            }
        );
    }

    async #handleGameMessage(message) {
        const { type, data } = message;

        if (!this.#isInitialized && type !== GAME_INFO) {
            await gameInitializationMutex.acquire();
        }
        switch (type) {
            case GAME_START:
                this.#handleGameStartEvent(data);
                break;
            case GAME_INFO:
                this.#handleGameInfoEvent(data);
                this.#isInitialized = true;
                gameInitializationMutex.release();
                break;
            case ROUND_CHANGE:
                this.#handleRoundChangeEvent(data);
                break;
            case PHASE_CHANGE:
                this.#handlePhaseChangeEvent(data);
                break;
            case GAME_END:
                this.#handleGameEndEvent(data);
                break;
            case INTERACT_HIDE_SUCCESS:
                this.#handleInteractHideSuccessEvent(data);
                break;
            case INTERACT_HIDE_FAIL:
                this.#handleInteractHideFailEvent(data);
                break;
            case INTERACT_SEEK_FAIL:
                this.#handleInteractSeekFailEvent(data);
                break;
            case INTERACT_SEEK_SUCCESS:
                this.#handlePlayerDeath(PLAYER_ELIMINATION_REASON.CAUGHT, data);
                break;
            case FAILED_TO_HIDE:
                this.#handlePlayerDeath(
                    PLAYER_ELIMINATION_REASON.FAILED_TO_HIDE,
                    data
                );
           
                break;
            case PLAYER_DISCONNECTED:
                this.#handlePlayerDeath(
                    PLAYER_ELIMINATION_REASON.PLAYER_DISCONNECTED,
                    data
                );
                break;
            case ELIMINATION_OUT_OF_SAFE_ZONE:
                this.#handlePlayerDeath(
                    PLAYER_ELIMINATION_REASON.OUT_OF_SAFE_ZONE,
                    data
                );
                
                break;
            case SAFE_ZONE_UPDATE:
                //맵축소
                this.#handleSafeZoneUpdateEvent(data);
                break;
            case GAME_RESULT:
                this.#handleGameResultEvent(data);
                break;
            //아이템 메세지: 나중에 static으로 추가하기
            case "ITEM_APPLIED_TO_PLAYER":
                // 넘어온 data 확인해보니 message 그대로 넘겨줘야함
                this.#handleItemAppliedPlayerSuccess(message);
                break;
            case "ITEM_APPLIED_TO_OBJECT":
                this.#handleItemAppliedObjectSuccess(message);
                break;
            case "ITEM_APPLICATION_FAILED_TO_PLAYER":
                break;
            case "ITEM_APPLICATION_FAILED_TO_OBJECT":
                this.#handleItemAppliedObjectFailed(message);
                break;
            case "ITEM_CLEARED":
                break;

            default:
                throw new Error(
                    "Unknown message type in GameRepository:" + type
                );
        }
    }

    #handleGameStartEvent() {
        this.#startedAt = new Date();
    }

    #handleGameInfoEvent(data) {
        // 페이즈 정보 초기화 (INITIALIZED)
        this.#currentPhase = data.currentPhase;
        // 팀 정보 초기화
        this.#foxTeam = new Team(data.foxTeam);
        this.#racoonTeam = new Team(data.racoonTeam);
    }

    #handleRoundChangeEvent(data) {
    }

    #handlePhaseChangeEvent(data) {
        this.#currentPhase = data.phase;
        this.#nextPhaseChangeAt = Date.parse(data.changeAt);
        this.#currentPhaseFinishAfterMilliSec = data.finishAfterMilliSec;



        if (this.#currentPhase === Phase.END) {
            // 한 라운드가 끝나면 역할 반전
            this.#racoonTeam.setIsHidingTeam(!this.#racoonTeam.isHidingTeam());
            this.#foxTeam.setIsHidingTeam(!this.#foxTeam.isHidingTeam());
        } else if (this.#currentPhase === Phase.GAME_END) {
            this.#setIsEnd();
        }

        this.getMe().then(async (me) => {
            if (
                this.#currentPhase === Phase.READY ||
                this.#currentPhase === Phase.MAIN
            ) {
                uiControlQueue.addPhaseChangeMessage(
                    this.#currentPhase,
                    data.finishAfterMilliSec
                );
            }
            if (this.#currentPhase === Phase.READY) {
                if (await me.isHidingTeam()) {


                    // 화면에 찾는 팀, 숨는 팀 플레이어들이 보이게 하기
                    this.#setTeamPlayersVisibility(this.getSeekingTeam(), true);
                    this.#setTeamPlayersVisibility(this.getHidingTeam(), true);

                    // 남은 찾는 횟수 UI 제거
                    uiControlQueue.addHideSeekCountUiMessage();
                } else {

                    // 화면에 찾는 팀 플레이어들이 보이게 하기
                    this.#setTeamPlayersVisibility(this.getSeekingTeam(), true);
                    // 화면에 숨는 팀 플레이어들이 보이지 않게 하기
                    this.#setTeamPlayersVisibility(this.getHidingTeam(), false);

                    // 남은 찾는 횟수 UI 초기화
                    uiControlQueue.addShowSeekCountUiMessage();
                }
            } else if (this.#currentPhase === Phase.MAIN) {
                if (await me.isHidingTeam()) {


                    // 화면에 찾는 팀 플레이어들이 보이게 하기
                    this.#setTeamPlayersVisibility(this.getSeekingTeam(), true);
                    // 화면에 숨는 팀 플레이어들이 보이지 않게 하기
                    this.#setTeamPlayersVisibility(this.getHidingTeam(), false);
                } else {


                    // 화면에 찾는 팀 플레이어들이 보이게 하기
                    this.#setTeamPlayersVisibility(this.getSeekingTeam(), true);
                    // 화면에 숨는 팀 플레이어들이 보이지 않게 하기
                    this.#setTeamPlayersVisibility(this.getHidingTeam(), false);
                }
            }
        });
    }

    #handleGameEndEvent(data) {
        this.#winningTeam = data.WINNING_TEAM;
        this.#setIsEnd();
    }

    getWinningTeam() {
        return this.#winningTeam;
    }

    #setIsEnd() {
        this.#isGameEnd = true;
    }

    getIsEnd() {
        return this.#isGameEnd;
    }

    #setTeamPlayersVisibility(team, isVisible) {
        for (let player of team.getPlayers()) {
            // 내 플레이어의 가시성은 Game.js에서 별도 처리
            if (player.getPlayerId() === this.#me.getPlayerId()) {
                continue;
            }

            player.getSprite().then((sprite) => {
                if (player.isDead()) {
                    sprite.visible = false;
                } else {
                    sprite.visible = isVisible;
                }
            });
        }
    }

    #handleInteractHideSuccessEvent(data) {
        const { playerId, objectId } = data;
        // 나의 결과는 무시 (플레이어 채널로 받음)
        if (playerId === this.#me.getPlayerId()) {
            return;
        }
    }

    #handleInteractHideFailEvent(data) {
        const { playerId, objectId, item } = data;
        // 나의 결과는 무시 (플레이어 채널로 받음)
        if (playerId === this.#me.getPlayerId()) {
            return;
        }
    }

    #handleInteractSeekSuccessEvent(data) {
        const { playerId, objectId } = data;
        // 나의 결과는 무시 (플레이어 채널로 받음)
        if (playerId === this.#me.getPlayerId()) {
            return;
        }
    }

    #handleInteractSeekFailEvent(data) {
        const { playerId, objectId } = data;
        // 나의 결과는 무시 (플레이어 채널로 받음)
        if (playerId === this.#me.getPlayerId()) {
            return;
        }

    }

    initializePlayer(data) {
        // 플레이어 초기 정보 설정
        const {
            playerPositionInfo,
            teamCharacter,
            teamSubscriptionInfo,
            items,
            playerNickname,
        } = data;

        this.#initialItems = items; // 초기 플레이어의 아이템 값
        this.#itemQ = items[0];
        this.#itemW = items[1];
        this.#me = new Player({
            playerId: playerPositionInfo.playerId,
            playerNickname,
            isReady: true,
        });
        this.#me.setPosition(playerPositionInfo);

        if (teamCharacter.toLowerCase() === "fox") {
            this.#me.setTeam(this.#foxTeam);
        } else {
            this.#me.setTeam(this.#racoonTeam);
        }

        // 팀 메시지 구독 시작
        this.startSubscribeTeam(teamSubscriptionInfo);
    }

    startSubscribeTeam(teamSubscriptionInfo) {
        this.#stompClient.subscribe(
            teamSubscriptionInfo,
            async (stompMessage) => {
                const message = JSON.parse(stompMessage.body);
                this.#handleTeamMessage(message);
            }
        );
    }

    #handleTeamMessage(message) {
        const { type, data } = message;
        switch (type) {
            case SHARE_POSITION:
                this.#handleSharePositionEvent(data);
                break;
            case COVER_SCREEN:
                break;
            case UNCOVER_SCREEN:
                break;
            case FREEZE:
                // this.#me.setCanMove(false);
                break;
            case UNFREEZE:
                // this.#me.setCanMove(true);
                break;
        }
    }

    #handleSharePositionEvent(data) {
        const { playerId, x, y, direction } = data;
        if (playerId === this.#me.getPlayerId()) {
            this.#me.setPosition({ x, y, direction });
        } else {
            const player = this.getPlayerWithId(playerId);
            player.setPosition({ x, y, direction });
        }
    }

    #handleGameResultEvent(data) {
        if (this.#gameResultFlag === true) return;
        this.#gameResultFlag = true;
        Object.keys(data).forEach((team) => {
            data[team].forEach((player) => {
                this.#gameResults.push({
                    nickname: player.nickname,
                    catchCount: player.catchCount,
                    playTime: player.playTimeInSeconds,
                    team: player.team,
                });
            });
        });
    }

    // gameResults getter
    getGameResults() {
        return this.#gameResults;
    }

    // 게임 시작 시각
    getStartedAt() {
        return this.#startedAt;
    }

    // 현재 페이즈
    getCurrentPhase() {
        return this.#currentPhase;
    }

    // 내 플레이어 정보
    getMe() {
        if (this.#me) {
            return Promise.resolve(this.#me);
        } else {
            return new Promise((resolve) => {
                const interval = setInterval(() => {
                    if (this.#me) {
                        clearInterval(interval);
                        resolve(this.#me);
                    }
                }, 10);
            });
        }
    }

    // 해당 id를 가지는 플레이어를 찾아 반환
    getPlayerWithId(playerId) {
        return this.getAllPlayers().find(
            (player) => player.getPlayerId() === playerId
        );
    }

    // 내 위치 정보 수정
    setMyPosition(position) {
        const { x, y, direction } = position;
        this.#stompClient.publish({
            destination: `/ws/rooms/${this.#roomNumber}/game/share-position`,
            body: JSON.stringify({
                x,
                y,
                direction,
            }),
        });
    }

    getRacoonTeam() {
        return this.#racoonTeam;
    }

    getFoxTeam() {
        return this.#foxTeam;
    }

    getHidingTeam() {
        return this.#foxTeam.isHidingTeam() ? this.#foxTeam : this.#racoonTeam;
    }

    getSeekingTeam() {
        return this.#foxTeam.isHidingTeam() ? this.#racoonTeam : this.#foxTeam;
    }

    getAllPlayers() {
        return this.#room.getJoinedPlayers();
    }

    getInitialItems() {
        return this.#initialItems;
    }

    // HP =====================================================================
    // 숨기 요청
    async requestHide(objectId) {
        const requestId = uuid();
        this.#stompClient.publish({
            destination: `/ws/rooms/${this.#roomNumber}/game/hide`,
            body: JSON.stringify({
                requestId,
                data: {
                    objectId,
                },
            }),
        });

        const hideResult = await asyncResponses.get(requestId);
        return Promise.resolve({
            isSucceeded: hideResult.type === INTERACT_HIDE_SUCCESS,
        });
    }

    // 탐색 요청
    async requestSeek(objectId) {
        const requestId = uuid();
        this.#stompClient.publish({
            destination: `/ws/rooms/${this.#roomNumber}/game/seek`,
            body: JSON.stringify({
                requestId,
                data: {
                    objectId,
                },
            }),
        });

        const seekResult = await asyncResponses.get(requestId);
        if (seekResult.type === INTERACT_SEEK_SUCCESS) {
            this.#handleSeekSuccessResult(seekResult.data);
        } else {
            this.#handleSeekFailResult(seekResult.data);
        }

        return Promise.resolve({
            isSucceeded: seekResult.type === INTERACT_SEEK_SUCCESS,
        });
    }

    // 찾기 성공 결과 반영
    #handleSeekSuccessResult(data) {
        const { foundPlayerId, objectId } = data;
        const restCatchCount = Player.MAX_SEEK_COUNT - data.catchCount;
        const requestedPlayerId = data.playerId;
        const foundPlayer = this.getPlayerWithId(foundPlayerId);
        const requestedPlayer = this.getPlayerWithId(requestedPlayerId);

        // 찾은 플레이어를 죽은 상태로 변경
        foundPlayer.setDead().then(() => {
            // 남은 시도 횟수 갱신
            requestedPlayer.setRestSeekCount(restCatchCount);
            // 찾은 횟수 갱신
            requestedPlayer.increaseCatchCount();
            uiControlQueue.addUpdateSeekCountUiMessage(restCatchCount);
        });
    }

    // 찾기 실패 결과 반영
    #handleSeekFailResult(data) {
        const { objectId } = data;
        const restCatchCount = Player.MAX_SEEK_COUNT - data.catchCount;
        const requestedPlayerId = data.playerId;

        const requestedPlayer = this.getPlayerWithId(requestedPlayerId);
        // 남은 시도 횟수 갱신
        requestedPlayer.setRestSeekCount(restCatchCount);

        this.#seekFailCatchCount = data.catchCount;

        uiControlQueue.addUpdateSeekCountUiMessage(restCatchCount);
    }

    getSeekFailCount() {
        return this.#seekFailCatchCount;
    }

    getNextPhaseChangeAt() {
        return this.#nextPhaseChangeAt;
    }

    getCurrentPhaseFinishAfterMilliSec() {
        return this.#currentPhaseFinishAfterMilliSec;
    }

    //맵축소
    #handleSafeZoneUpdateEvent(data) {
        const safeZone = data; //[0, 0, 1600, 1600],
        this.#currentSafeZone = safeZone;
    }
    //맵축소
    getCurrentSafeZone() {
        return this.#currentSafeZone;
    }

    getCurrentEliminatedPlayerAndTeam() {
        return this.#currentEliminatedPlayerAndTeam;
    }

    #handlePlayerDeath(reasonType, data) {
        const { playerId, foundPlayerId } = data;

        this.getMe().then(async (me) => {
            // 잡혀서 죽은거면
            if (reasonType === PLAYER_ELIMINATION_REASON.CAUGHT) {
                // 해당 플레이어를 탈락 처리
                const player = this.getPlayerWithId(foundPlayerId);
                await player.setDead();
                data.victimPlayerNickname = player.getPlayerNickname();
                // 공격자 정보 추가
                data.attackerNickname = this.getPlayerWithId(
                    data.playerId
                ).getPlayerNickname();
            }
            // 발견 당한 플레이어 정보가 없는데 playerId가 나이면
            else if (me.getPlayerId() === playerId) {
                // 나를 탈락 처리
                await me.setDead();
                await this.getPlayerWithId(playerId).setDead();
                data.victimPlayerNickname = me.getPlayerNickname();
            }
            // 이외의 경우 다른 플레이어의 탈락을 의미함
            else {
                const player = this.getPlayerWithId(playerId);
                await player.setDead();
                data.victimPlayerNickname = player.getPlayerNickname();
            }

            // 사망 메시지 표시
            uiControlQueue.addDeadMessage(reasonType, data);
        });
    }

    #handleItemAppliedObjectFailed(data) {
    }
    // 탐색결과로 아이템 찾은 플레이어에게 아이템 적용
    #handleItemAppliedPlayerSuccess(message) {
        // 발견된 아이템값 저장
        this.#itemAppliedFromObject = message.data.item;

        if (message.data.item != undefined) {
            this.setItemSpeed(message.data.newSpeed);
        }

        if (message.data.item === "BEEHIVE") {
            setTimeout(() => {
                this.setItemSpeed(200);
            }, 5 * 1000);
        }
        if (message.data.item === "BANANA") {
            setTimeout(() => {
                this.setItemSpeed(200);
            }, 5 * 1000);
        }
        if (message.data.item === "POISON_MUSHROOM") {
            this.#isPoisonMushroomUsed = true;
            setTimeout(() => {
                this.#isPoisonMushroomUsed = false;
            }, 10 * 1000);
        }
    }

    getItemAppliedFromObject() {
        return this.#itemAppliedFromObject;
    }

    setItemAppliedFromObject(now) {
        // 적용중인 아이템 초기화
        this.#itemAppliedFromObject = now;
    }

    // 아이템 object에 적용결과
    #handleItemAppliedObjectSuccess(data) {
    }

    async requestItemUse(item, targetId) {
        const requestId = uuid();

        this.#stompClient.publish({
            destination: `/ws/rooms/${this.#roomNumber}/game/use/item`,
            body: JSON.stringify({
                requestId,
                data: {
                    item: item,
                    targetId: targetId,
                },
            }),
        });

        if (item === "MUSHROOM") {
            this.setIsMushroomUsed(true);
        }
        const requestItemResult = await asyncResponses.get(requestId);

        if (
            // 아이템 성공적으로 적용시 q,i 바꿔놓기
            requestItemResult.type === "ITEM_APPLIED_TO_PLAYER" ||
            requestItemResult.type === "ITEM_APPLIED_TO_OBJECT"
        ) {
            // 아이템 확인해서 q랑같으면 바꿈,  w랑 같으면 바꿈
            if (requestItemResult.data.item === this.#itemQ) {
                this.#itemQapplied = true;
            } else {
                this.#itemWapplied = true;
            }
        }
        return Promise.resolve({
            isSucceeded:
                requestItemResult.type === "ITEM_APPLIED_TO_PLAYER" ||
                requestItemResult.type === "ITEM_APPLIED_TO_OBJECT",
            speed: requestItemResult.data.newSpeed,
        });
    }

    // 로컬플레이어의 아이템이름 반환
    getItemQ() {
        return this.#itemQ;
    }
    getItemW() {
        return this.#itemW;
    }

    getItemQapplied() {
        return this.#itemQapplied;
    }
    getItemWapplied() {
        return this.#itemWapplied;
    }
    setItemQapplied(value) {
        this.#itemQapplied = value;
    }
    setItemWapplied(value) {
        this.#itemWapplied = value;
    }

    getItemSpeed() {
        return this.#itemSpeed;
    }
    setItemSpeed(speed) {
        this.#itemSpeed = speed;
    }
    getIsMushroomUsed() {
        return this.#isMushroomUsed;
    }
    setIsMushroomUsed(isUsed) {
        this.#isMushroomUsed = isUsed;
    }

    getIsPoisonMushroomUsed() {
        return this.#isPoisonMushroomUsed;
    }

    setIsPoisonMushroomUsed(isUsed) {
        this.#isPoisonMushroomUsed = isUsed;
    }
}
