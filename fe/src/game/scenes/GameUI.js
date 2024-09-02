import Phaser from "phaser";

import uiControlQueue, { MESSAGE_TYPE } from "../../util/UIControlQueue";
import { getRoomRepository } from "../../repository";
import { Phase } from "../../repository/_game";
import { PLAYER_ELIMINATION_REASON } from "../../repository/interface";

export default class GameUI extends Phaser.Scene {
    static DEFAULT_SEEK_COUNT = 5;

    constructor() {
        super({ key: "game-ui" });

        const gameRepositoryTrial = setInterval(() => {
            if (getRoomRepository()) {
                this.gameRepository = getRoomRepository().getGameRepository();
                clearInterval(gameRepositoryTrial);
            }
        }, 60);

        // 화면에 표시되어 있는 각 팀 플레이어 수
        this.drawnRacoonHeads = 0;
        this.drawnFoxHeads = 0;

        // 화면에 표시되어 있는 각 팀 죽은 플레이어 수
        this.deadRacoonHeads = 0;
        this.deadFoxHeads = 0;

        // 화면에 표시되어 있는 남은 찾기 횟수
        this.drawnMagnifier = 0;
        this.isMagnifierVisible = false;

        // 중앙 상단 메시지가 떠있는지 여부
        this.isTopCenterMessageVisible = false;

        // 플레이어의 사망 기록을 화면에 하나씩만 보여 주기 위한 큐와 변수
        this.killLogQueue = [];
        this.isDisplayingKillLog = false;
    }

    preload() {
        this.load.image("foxHeadAlive", "assets/object/foxHeadAlive.png");
        this.load.image("foxHeadDead", "assets/object/foxHeadDead.png");
        this.load.image("racoonHeadAlive", "assets/object/racoonHeadAlive.png");
        this.load.image("racoonHeadDead", "assets/object/racoonHeadDead.png");
        this.load.image("failed", "assets/object/failed.png");

        this.load.image(
            "chickenEffectPhoto",
            "assets/object/chickenEffectPhoto.png"
        );

        this.load.image("magnifier-item", "assets/object/item/glassItem.png");
    }

    async #getNumOfRacoons() {
        return getRoomRepository()
            .getGameRepository()
            .then((gameRepository) => {
                return gameRepository.getRacoonTeam().getPlayers().length;
            });
    }

    async #getNumOfDeadRacoons() {
        return getRoomRepository()
            .getGameRepository()
            .then((gameRepository) => {
                return gameRepository
                    .getRacoonTeam()
                    .getPlayers()
                    .filter((player) => player.isDead()).length;
            });
    }

    async #getNumOfFoxes() {
        return getRoomRepository()
            .getGameRepository()
            .then((gameRepository) => {
                return gameRepository.getFoxTeam().getPlayers().length;
            });
    }

    async #getNumOfDeadFoxes() {
        return getRoomRepository()
            .getGameRepository()
            .then((gameRepository) => {
                return gameRepository
                    .getFoxTeam()
                    .getPlayers()
                    .filter((player) => player.isDead()).length;
            });
    }

    create() {
        //초기 아이템 이미지 업데이트
        this.createInitialItems();
        this.prevseekFailCount = 0;

        //초기화
        this.prevPlayer = null;

        this.groupRacoon = this.add.group();
        this.groupFox = this.add.group();

        // Add timer background
        this.timerBackground = this.add
            .image(this.cameras.main.width / 2, 20, "timer-background")
            .setOrigin(0.5, 0)
            .setDisplaySize(
                this.cameras.main.width * 0.1,
                this.cameras.main.width * 0.05
            );

        const horizontalCenterOfTimerBackground = this.timerBackground.x;
        const verticalCenterOfTimerBackground =
            this.timerBackground.y + this.timerBackground.displayHeight / 2;

        this.timerDigit1 = this.add.text(0, 0, "-", {
            fontSize: this.timerBackground.height,
            fill: "#fff",
            fontFamily: "m6x11",
        });
        this.timerDigit2 = this.add.text(0, 0, "-", {
            fontSize: this.timerBackground.height,
            fill: "#fff",
            fontFamily: "m6x11",
        });

        // Calculate the width of the timer digits
        const timerDigitWidth = this.timerDigit1.width;

        const horizontalGap = this.timerBackground.width / 8;
        const horizontalAdjustment = 8;

        // Position timer digits relative to the center of timerBackground
        this.timerDigit1.setPosition(
            horizontalCenterOfTimerBackground -
                timerDigitWidth / 2 -
                horizontalGap -
                horizontalAdjustment, // Adjust the -5 to fine-tune spacing
            verticalCenterOfTimerBackground - this.timerDigit1.height / 2
        );

        this.timerDigit2.setPosition(
            horizontalCenterOfTimerBackground +
                timerDigitWidth / 2 +
                horizontalGap -
                horizontalAdjustment, // Adjust the +5 to fine-tune spacing
            verticalCenterOfTimerBackground - this.timerDigit2.height / 2
        );

        this.magnifierIcon = this.add
            .image(
                this.cameras.main.width - 100,
                this.cameras.main.height - 50,
                "magnifier-item"
            )
            .setDisplaySize(60, 60);
        this.magnifierIcon.visible = false;

        this.counterText = this.add.text(
            this.cameras.main.width - 70,
            this.cameras.main.height - 64,
            `X ${GameUI.DEFAULT_SEEK_COUNT}`,
            {
                fontSize: "30px",
                color: "#ffffff",
                fontFamily: "m6x11",
            }
        );
        this.counterText.visible = false;

        // 닭소리
        this.surprisingChickenSound = this.sound.add("surprising-chicken", {
            volume: 1,
        });
        this.initializeChickenHeads();

        // 아군 탐색 성공 사운드
        this.allySeekSuccessSound = this.sound.add("hp-seek-success", {
            volume: 1,
        });

        // 아군 탐색 실패 사운드
        this.allySeekFailSound = this.sound.add("hp-seek-fail", {
            volume: 1,
        });

        // 적군 탐색 성공 사운드
        this.enemySeekSuccessSound = this.sound.add("hp-seek-fail", {
            volume: 1,
        });

        // 아군 사망 사운드
        this.allyDeadSound = this.sound.add("hp-seek-fail", {
            volume: 1,
        });

        // 나뭇잎 이펙트
        this.leafEffect = this.add
            .sprite(0, 0, "leaf-fullscreen-effect")
            .setDisplaySize(this.scale.width, this.scale.height)
            .setPosition(this.scale.width / 2, this.scale.height / 2)
            .setAlpha(0.5)
            .play("leaf-fullscreen-effect-animation");
        this.leafEffect.visible = false;
    }

    // 아이템 이미지 화면에 렌더링
    createInitialItemImage(itemName, itemIndex) {
        // 둥근 모서리의 아이템 박스 디자인 설정
        const boxSize = 70; // 박스 크기
        const cornerRadius = 15; // 모서리 반경
        const box = this.add.graphics();
        box.fillStyle(0xcccccc, 0.7); // 연한 회색, 50% 투명도

        const spacing = 75; // 아이템 두개 사이의 간격
        const height = this.cameras.main.height - 45; // 맨밑보다 좀 위에 띄우기
        let width;
        if (itemIndex === 0) {
            // 키다운 글자 Q,E 화면 생성
            width = (this.cameras.main.width - spacing) / 2; //첫번쨰 아이템
            this.add
                .image(width - 20, height + 26, "keycap-Q")
                .setScale(2)
                .setDepth(1);
        } else {
            width = (this.cameras.main.width + spacing) / 2; // 두번째 아이템
            this.add
                .image(width - 20, height + 26, "keycap-W")
                .setScale(2)
                .setDepth(1);
        }
        switch (itemName) {
            // 바나나
            case "BANANA":
                this.add
                    .image(width, height, "banana")
                    .setOrigin(0.5, 0.5)
                    .setScale(1.8);
                box.fillRoundedRect(
                    width - boxSize / 2,
                    height - boxSize / 2 + 5,
                    boxSize,
                    boxSize,
                    cornerRadius
                );
                break;
            // 벌통
            case "BEEHIVE":
                this.add
                    .image(width, height, "beeHive")
                    .setOrigin(0.5, 0.5)
                    .setScale(1.8);
                box.fillRoundedRect(
                    width - boxSize / 2,
                    height - boxSize / 2 + 5,
                    boxSize,
                    boxSize,
                    cornerRadius
                );
                break;
            // 독버섯
            case "POISON_MUSHROOM":
                this.add.image(width, height, "poisonMushroom").setScale(0.6);
                box.fillRoundedRect(
                    width - boxSize / 2,
                    height - boxSize / 2 + 5,
                    boxSize,
                    boxSize,
                    cornerRadius
                );
                break;
            // 고추
            case "RED_PEPPER":
                this.add
                    .image(width, height, "pepper")
                    .setOrigin(0.5, 0.5)
                    .setScale(1.8);
                box.fillRoundedRect(
                    width - boxSize / 2,
                    height - boxSize / 2 + 5,
                    boxSize,
                    boxSize,
                    cornerRadius
                );
                break;
            // 표고버섯
            case "MUSHROOM":
                this.add
                    .image(width, height, "mushroom")
                    .setOrigin(0.5, 0.5)
                    .setScale(1.8);
                box.fillRoundedRect(
                    width - boxSize / 2,
                    height - boxSize / 2 + 5,
                    boxSize,
                    boxSize,
                    cornerRadius
                );
                break;
            // 나뭇잎
            case "LEAF":
                box.fillRoundedRect(
                    width - boxSize / 2,
                    height - boxSize / 2 + 5,
                    boxSize,
                    boxSize,
                    cornerRadius
                );
                break;
        }
    }

    // 아이템 이미지 서버에서 받아오기, gamerepo 생긴 뒤에 실행
    async createInitialItems() {
        getRoomRepository()
            .getGameRepository()
            .then((gameRepository) => {
                const items = gameRepository.getInitialItems();
                items.forEach((item, idx) => {
                    this.createInitialItemImage(item, idx);
                });
            });
    }

    initializeChickenHeads() {
        this.chickenHeads = [];

        // 왼쪽 아래부터 반시계방향
        const chickenHead1 = this.add.image(
            100,
            this.cameras.main.height - 200,
            "chicken-head-1"
        );
        this.chickenHeads.push(chickenHead1);

        const chickenHead2 = this.add.image(
            this.cameras.main.width - 100,
            this.cameras.main.height - 100,
            "chicken-head-1"
        );
        chickenHead2.setFlipX(true);
        chickenHead2.setScale(1.5);
        this.chickenHeads.push(chickenHead2);

        const chickenHead3 = this.add.image(
            this.cameras.main.width - 200,
            100,
            "chicken-head-1"
        );
        chickenHead3.setFlipX(true);
        chickenHead3.setFlipY(true);
        chickenHead3.setRotation(1.0);
        this.chickenHeads.push(chickenHead3);

        const chickenHead4 = this.add.image(100, 200, "chicken-head-1");
        chickenHead4.setRotation(2.0);
        chickenHead4.setScale(1, 1);
        this.chickenHeads.push(chickenHead4);

        const chickenHead5 = this.add.image(
            this.cameras.main.width / 2,
            300,
            "chicken-head-1"
        );
        chickenHead5.setFlipY(true);
        chickenHead5.setScale(1.5);
        this.chickenHeads.push(chickenHead5);

        // 일단 모두 숨기기
        this.chickenHeads.forEach((chickenHead) => {
            chickenHead.visible = false;
        });
    }

    updateTimer() {
        getRoomRepository()
            .getGameRepository()
            .then((gameRepository) => {
                if (gameRepository.getIsEnd()) {
                    this.timerDigit1.setText("-");
                    this.timerDigit2.setText("-");
                    return;
                }

                const nextPhaseChangeAt = gameRepository.getNextPhaseChangeAt();
                if (nextPhaseChangeAt) {
                    const now = new Date().getTime();
                    const remainMilliSec = nextPhaseChangeAt - now;
                    const remainSec = Math.floor(remainMilliSec / 1000);
                    if (
                        !this.lastDisplayedRemainSec ||
                        this.lastDisplayedRemainSec !== remainSec
                    ) {
                        this.lastDisplayedRemainSec = remainSec;
                        // 십의 자리 업데이트
                        this.timerDigit1.setText(Math.floor(remainSec / 10));
                        // 일의 자리 업데이트
                        this.timerDigit2.setText(remainSec % 10);
                    }
                }
            });
    }

    update() {
        // 1% 확률로 화면 전체에 나뭇잎 이펙트 재생
        if (Math.random() < 0.01 && !this.leafEffect.visible) {
            this.leafEffect.visible = true;
            this.leafEffect.setAlpha(0.5);
            this.leafEffect.play("leaf-fullscreen-effect-animation");

            this.tweens.add({
                targets: this.leafEffect,
                alpha: 0,
                duration: 2000,
                ease: "Linear",
                onComplete: () => {
                    this.leafEffect.visible = false;
                },
            });
        }

        // 화면에 띄우고 있는 킬 로그는 없는데 띄워야 할 킬 로그가 있을 때
        if (!this.isDisplayingKillLog && this.killLogQueue.length > 0) {
            // 화면에 킬 로그 띄우기
            const killLog = this.killLogQueue.shift();
            this.isDisplayingKillLog = true;
            this.#showKillLog(killLog);
        }

        this.updateImage();
        getRoomRepository()
            .getGameRepository()
            .then((gameRepository) => {
                while (uiControlQueue.hasGameUiControlMessage()) {
                    const message = uiControlQueue.getGameUiControlMessage();
                    switch (message.type) {
                        case MESSAGE_TYPE.TOP_CENTER_MESSAGE:
                            this.showTopCenterMessage(message.data);
                            break;
                        case MESSAGE_TYPE.HIDE_SEEK_COUNT_UI:
                            this.#hideSeekCountUi();
                            break;
                        case MESSAGE_TYPE.SHOW_SEEK_COUNT_UI:
                            this.#showSeekCountUi();
                            break;
                        case MESSAGE_TYPE.UPDATE_SEEK_COUNT_UI:
                            this.#updateSeekCountUi(message.data.restSeekCount);
                            break;
                        case MESSAGE_TYPE.SURPRISE_CHICKEN:
                            this.doChickenSurprise();
                            break;
                        case MESSAGE_TYPE.PLAYER_DEAD:
                            this.#announcePlayerElimination(message.data);
                            break;
                        case MESSAGE_TYPE.GAME_END:
                            this.#showGameEndMessage(
                                message.data.redirectAfter ?? 3000
                            );
                            break;
                        default:
                            break;
                    }
                }
                if (
                    gameRepository.getMe().then((me) => {
                        // 닭 보여주는 이벤트, 숨는팀이면 보이지않음
                        this.showChickenEffect(
                            me.isHidingTeam(),
                            gameRepository.getSeekFailCount()
                        );
                    })
                )
                    if (uiControlQueue.hasGameUiControlMessage()) {
                        const message =
                            uiControlQueue.getGameUiControlMessage();
                        switch (message.type) {
                            case MESSAGE_TYPE.TOP_CENTER_MESSAGE:
                                this.showTopCenterMessage(message.data);
                                break;
                            default:
                                break;
                        }
                    }

                if (gameRepository.getIsEnd()) {
                    this.progressBar.width = 0;
                } else {
                    this.updateTimer();
                }

                //  TODO:Q, W가 사용되었으면 화면에 이미지 추가
                if (gameRepository.getItemQapplied()) {
                    this.add
                        .image(
                            (this.cameras.main.width - 75) / 2 + 3,
                            this.cameras.main.height - 45,
                            "failed"
                        )
                        .setDepth(1000);
                    gameRepository.setItemQapplied(false); // 원래대로 값 바꿔줌
                } else if (gameRepository.getItemWapplied()) {
                    this.add
                        .image(
                            (this.cameras.main.width + 75) / 2,
                            this.cameras.main.height - 45,
                            "failed"
                        )
                        .setDepth(1000);
                    gameRepository.setItemWapplied(false); // 원래대로 값 바꿔줌
                }
            });
    }

    showChickenEffect(isHidingTeam, seekFailCount) {
        if (isHidingTeam) {
            // 전부 안보이게 하기
            return;
        }
        // 전부 보이게 만들기
        if (seekFailCount > this.prevseekFailCount) {
            const camera = this.cameras.main;
            const width = camera.width;
            const height = camera.height;
            let x, y;
            // 1,2는 fliped 이미지로 넣기
            switch (seekFailCount) {
                case 1:
                    (x = 20), (y = 20);
                    break;
                case 2:
                    (x = width - 20), (y = 20);
                    break;
                case 3:
                    (x = 20), (y = height - 20);
                    break;
                default:
                    x = width - 20;
                    y = height - 20;
            }
            const newEffect = this.add
                .image(x, y, "chickenEffectImage")
                .setOrigin(0.5);
            // 탐색 횟수 업데이트
            this.prevseekFailCount = seekFailCount;
        }
    }

    async updateImage() {
        // 화면에 아직 그려지지 않은 기본 머리 스프라이트만 새로 그려줌
        if (this.drawnFoxHeads < (await this.#getNumOfFoxes())) {
            for (
                let num = this.drawnFoxHeads + 1;
                num <= (await this.#getNumOfFoxes());
                num++
            ) {
                this.add
                    .image(
                        (this.cameras.main.width * 9) / 10,
                        (this.cameras.main.height * num) / 6,
                        "foxHeadAlive"
                    )
                    .setDisplaySize(80, 80);
            }
            // 머리 개수 갱신
            this.drawnFoxHeads = await this.#getNumOfFoxes();
        }
        if (this.drawnRacoonHeads < (await this.#getNumOfRacoons())) {
            for (
                let num = this.drawnRacoonHeads + 1;
                num <= (await this.#getNumOfRacoons());
                num++
            ) {
                this.add
                    .image(
                        this.cameras.main.width / 10,
                        (this.cameras.main.height * num) / 6,
                        "racoonHeadAlive"
                    )
                    .setDisplaySize(80, 80);
            }
            this.drawnRacoonHeads = await this.#getNumOfRacoons();
        }

        // 죽은 머리 스프라이트만 새로 그려줌
        if (this.deadFoxHeads < (await this.#getNumOfDeadFoxes())) {
            for (
                let num = this.deadFoxHeads + 1;
                num <= (await this.#getNumOfDeadFoxes());
                num++
            ) {
                this.add
                    .image(
                        this.cameras.main.width * 0.9,
                        (this.cameras.main.height * num) / 6,
                        "foxHeadDead"
                    )
                    .setDisplaySize(80, 80);
                this.add
                    .image(
                        this.cameras.main.width * 0.9,
                        (this.cameras.main.height * num) / 6,
                        "failed"
                    )
                    .setDisplaySize(80, 80);
            }
            this.deadFoxHeads = await this.#getNumOfDeadFoxes();
        }

        if (this.deadRacoonHeads < (await this.#getNumOfDeadRacoons())) {
            for (
                let num = this.deadRacoonHeads + 1;
                num <= (await this.#getNumOfDeadRacoons());
                num++
            ) {
                this.add
                    .image(
                        this.cameras.main.width / 10 - 3,
                        (this.cameras.main.height * num + 3) / 6,
                        "racoonHeadDead"
                    )
                    .setDisplaySize(80, 80);
                this.add
                    .image(
                        this.cameras.main.width / 10 - 3,
                        (this.cameras.main.height * num + 3) / 6,
                        "failed"
                    )
                    .setDisplaySize(80, 80);
            }
        }
    }

    showTopCenterMessage(data) {
        const { phase, finishAfterMilliSec } = data;

        const restSeconds = Math.floor(finishAfterMilliSec / 1000);
        const messageTokens = [];

        getRoomRepository()
            .getGameRepository()
            .then((gameRepository) => {
                if (this.isTopCenterMessageVisible) {
                    return;
                }
                this.isTopCenterMessageVisible = true;

                gameRepository.getMe().then(async (me) => {
                    if (phase === Phase.READY) {
                        if (await me.isHidingTeam()) {
                            messageTokens.push(
                                `앞으로 ${restSeconds}초 동안 숨어야한다구리!`
                            );
                        } else {
                            messageTokens.push(
                                `앞으로 ${restSeconds}초 뒤에 찾아야한다구리!`
                            );
                        }
                    } else if (phase === Phase.MAIN) {
                        const foeAnimal = (await me.isRacoonTeam())
                            ? "여우"
                            : "너구리";
                        if (await me.isHidingTeam()) {
                            messageTokens.push(
                                `${foeAnimal}들이 쫓아오고 있다구리!`
                            );
                        } else {
                            messageTokens.push(
                                `${foeAnimal}들을 찾아야한다구리!`
                            );
                        }
                    }

                    const message = messageTokens.join(" ");
                    const text = this.add.text(
                        this.cameras.main.width / 2,
                        this.cameras.main.height / 6,
                        message,
                        {
                            color: "#ffffff",
                            backgroundColor: "#000000aa",
                            align: "center",
                            fontSize: 20,
                            fontFamily: "Galmuri11",
                            padding: {
                                left: 8,
                                right: 8,
                                top: 8,
                                bottom: 8,
                            },
                        }
                    );
                    text.setOrigin(0.5, 0.5);

                    this.tweens.add({
                        targets: text,
                        alpha: 0,
                        duration: 15000,
                        ease: "Power1",
                        onComplete: () => {
                            text.destroy();
                            this.isTopCenterMessageVisible = false;
                        },
                    });
                });
            });
    }

    #announcePlayerElimination(message) {
        const { reasonType, data } = message;
        const { victimPlayerNickname } = data;

        let messageText = "";
        switch (reasonType) {
            case PLAYER_ELIMINATION_REASON.CAUGHT:
                const { attackerNickname } = data;
                messageText = `[${victimPlayerNickname}]님이 [${attackerNickname}]님에게 들켰습니다.`;
                break;
            case PLAYER_ELIMINATION_REASON.FAILED_TO_HIDE:
                messageText = `[${victimPlayerNickname}]님이 시간 안에 숨지 못했습니다.`;
                break;
            case PLAYER_ELIMINATION_REASON.OUT_OF_SAFE_ZONE:
                messageText = `[${victimPlayerNickname}]님이 금지 구역에 포함되었습니다.`;
                break;
            case PLAYER_ELIMINATION_REASON.PLAYER_DISCONNECTED:
                messageText = `[${victimPlayerNickname}]님이 게임에서 이탈했습니다.`;
                break;
        }

        this.killLogQueue.push(messageText);
    }

    #showGameEndMessage(redirectAfter) {
        // 게임 종료 후 안내 메시지
        const gameEndMessage = this.add.text(
            this.cameras.main.width,
            0,
            `${Math.ceil(redirectAfter / 1000)}초 후에 로비로 이동합니다`,
            {
                fontSize: 30,
                fontFamily: "Galmuri11",
                color: "#ffffff",
                backgroundColor: "#000000aa",
                align: "center",
                padding: {
                    left: 8,
                    right: 8,
                    top: 8,
                    bottom: 8,
                },
            }
        );
        gameEndMessage.setOrigin(1, 0);
        gameEndMessage.setDepth(1000);

        this.tweens.add({
            targets: gameEndMessage,
            alpha: 0,
            duration: redirectAfter,
            ease: "Power1",
            onComplete: () => {
                gameEndMessage.destroy();
            },
        });
    }

    #hideSeekCountUi() {
        this.magnifierIcon.visible = false;
        this.counterText.visible = false;
    }

    #showSeekCountUi() {
        this.magnifierIcon.visible = true;
        this.counterText.visible = true;
        this.counterText.text = `X ${GameUI.DEFAULT_SEEK_COUNT}`;
    }

    #updateSeekCountUi(restSeekCount) {
        this.counterText.text = `X ${restSeekCount}`;
    }

    doChickenSurprise() {
        // 닭 울음 소리 재생하고
        this.surprisingChickenSound.play();
        // 3초 뒤에 사라지는 닭 머리들을 화면에 띄움
        // 단, 랜덤하게 1~3개만 띄움
        const numChickenHeadsToShow = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < numChickenHeadsToShow; i++) {
            const chickenHead = this.chickenHeads[i];
            chickenHead.visible = true;
            this.tweens.add({
                targets: chickenHead,
                alpha: 0,
                duration: 5000,
                ease: "Power1",
                onComplete: () => {
                    chickenHead.visible = false;
                },
            });
        }
    }

    #showKillLog(messageText) {
        const text = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 5,
            messageText,
            {
                fontFamily: "Galmuri11",
                color: "#ffffff",
                backgroundColor: "#ff0000aa",
                align: "center",
                fontSize: 20,
                padding: {
                    left: 10,
                    right: 10,
                    top: 10,
                    bottom: 10,
                },
            }
        );
        text.setOrigin(0.5, 0.5);

        this.tweens.add({
            targets: text,
            alpha: 0,
            duration: 3000,
            ease: "Power1",
            onComplete: () => {
                text.destroy();
                this.isDisplayingKillLog = false;
            },
        });
    }
}
