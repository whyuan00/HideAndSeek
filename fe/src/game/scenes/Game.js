import Phaser from "phaser";

import MyPlayerSprite, { HandlePlayerMove } from "./Player";
import OtherPlayerSprite from "./OtherPlayer";
import MapTile from "./MapTile";
import TextGroup from "./TextGroup";

import { isFirstPress } from "../../util/keyStroke";
import { getRoomRepository } from "../../repository";
import { Phase } from "../../repository/_game";
import uiControlQueue from "../../util/UIControlQueue";

import eventBus from "../EventBus"; //씬 간 소통위한 이벤트리스너 호출
import { LOBBY_ROUTE_PATH } from "../../pages/Lobby/Lobby";
import axios from "../../network/AxiosClient";
import { WAITING_ROOM_ROUTE_PATH } from "../../pages/WaitingRoom/WaitingRoom";

export class game extends Phaser.Scene {
    //cursor = this.cursor.c
    //cursors = Phaser.Input.Keyboard.KeyboardPlugin;
    //fauna = Phaser.Physics.Arcade.Sprite;

    #createdFogTileCoordinates = [];
    constructor() {
        super("game");

        this.MapTile = null;
        this.objects = null;
        this.lastSentTime = Date.now();

        this.roomRepository = getRoomRepository();

        this.lastWallPos = {};
        this.hintImages = {};
        this.shownHintForCurrentPhase = false;
        this.modalShown = false;

        this.updatePaused = false;
        this.gameResults = [];
        this.winningTeam = null;
    }

    #isAlreadyFogCreatedCoordinate(x, y) {
        return this.#createdFogTileCoordinates.some(
            (coordinate) => coordinate.x === x && coordinate.y === y
        );
    }

    preload() {
        this.load.image("racoon", "assets/character/image.png");
        this.load.image("success", "assets/object/success.png");
        this.load.image("failed", "assets/object/failed.png");

        this.cursors = this.input.keyboard.createCursorKeys();
        this.headDir = 2; //under direction
        this.moving = 0;
    }

    create() {
        this.m_cursorKeys = this.input.keyboard.createCursorKeys();

        // 키 입력 이벤트 추가
        this.m_cursorKeys.Q = this.input.keyboard.addKey("Q");
        this.m_cursorKeys.W = this.input.keyboard.addKey("W");
        this.m_cursorKeys.R = this.input.keyboard.addKey("R");

        this.text = new TextGroup(this); // 팝업텍스트 객체

        this.graphics = this.add.graphics().setDepth(1000); //선만들기 위한 그래픽

        // MapTile.js에서 만들어놓은 함수로 map 호출해주기
        this.maptile = new MapTile(this);
        this.maptile
            .createMap("map-2024-07-29", "dungeon", "tiles")
            .setupCollisions();

        // playercam 정의, zoomTo: 300ms 동안 1.5배 zoom
        const playercam = this.cameras.main;
        playercam.zoomTo(3, 300);

        // group생성, 플레이어와의 충돌속성부여
        this.group = this.physics.add.staticGroup(); // 그룹 초기화

        // 로컬플레이어 객체 생성, 카메라 follow
        this.roomRepository.getGameRepository().then((gameRepository) => {
            gameRepository.getMe().then((me) => {
                const { x, y, direction } = me.getPosition();
                this.localPlayer = new MyPlayerSprite(
                    this,
                    x,
                    y,
                    "fauna-idle-down",
                    me.getPlayerNickname()
                );
                playercam.startFollow(this.localPlayer);
                // player.js 에서 player 키조작이벤트 불러옴
                this.playerMoveHandler = new HandlePlayerMove(
                    this.cursors,
                    this.localPlayer,
                    this.headDir,
                    this.moving
                    // this.isReversed,//preload에 false로 시작, this.localPlayer.isReversed = false;
                );
                // 죽은 플레이어는 충돌 처리 안함
                const passDeadPlayerCollider = (wall, playerSprite) => {
                    return !me.isDead();
                };

                //로컬플레이어와 layer의 충돌설정
                this.physics.add.collider(
                    this.localPlayer,
                    this.maptile.getLayers().BackGround,
                    undefined,
                    passDeadPlayerCollider
                );
                this.physics.add.collider(
                    this.localPlayer,
                    this.maptile.getLayers().Walls,
                    undefined,
                    passDeadPlayerCollider
                );
                this.physics.add.collider(
                    this.localPlayer,
                    this.maptile.getLayers().BackGround_Of_Wall,
                    undefined,
                    passDeadPlayerCollider
                );
                this.physics.add.collider(
                    this.localPlayer,
                    this.maptile.getLayers().HP,
                    undefined,
                    passDeadPlayerCollider
                );
                // floatinglayer를 player 보다 나중에 호출해서 z-index 구현
                this.maptile.createFloatingMap();

                // maptile에서 오브젝트 어레이 가져옴
                const HPs = this.maptile.createHP();
                HPs.forEach((HP) => {
                    const X = this.tileToPixel(HP.x);
                    const Y = this.tileToPixel(HP.y);
                    let hpObject = this.group.create(X, Y, "oak");
                    hpObject.setSize(16, 16);
                    hpObject.setData("id", HP.id);
                    hpObject.setAlpha(0); //투명하게
                });

                this.physics.add.collider(
                    this.localPlayer,
                    this.group,
                    undefined,
                    passDeadPlayerCollider
                );

                // 다른 플레이어 스프라이트
                this.otherPlayerSprites = [];
                for (let player of gameRepository.getAllPlayers()) {
                    if (player.getPlayerId() === me.getPlayerId()) {
                        continue;
                    }

                    const otherPlayerSprite = new OtherPlayerSprite(
                        this,
                        player.getPosition().x,
                        player.getPosition().y,
                        "fauna-idle-down",
                        player.getPlayerId()
                    );
                    otherPlayerSprite.visible = true;
                    player.setSprite(otherPlayerSprite);
                    this.otherPlayerSprites.push(otherPlayerSprite);
                }

                // //setinteval 대신 addevent 함수씀
                this.time.addEvent({
                    delay: 10,
                    callback: this.updateAnotherPlayerSpritePosition, // mockingPostion 이라는 함수 만듦
                    callbackScope: this, // this를 현재 씬으로 지정
                    loop: true, // 여러번 실행
                });

                //작아지는 맵은 제일 위에 위치해야함!!
                this.mapWalls = this.physics.add.staticGroup();
                //플레이어와 충돌처리
                this.physics.add.collider(
                    this.localPlayer,
                    this.mapWalls,
                    undefined,
                    passDeadPlayerCollider
                );

                //game-ui 씬
                this.scene.run("game-ui");
                // 이벤트리스너
            });
        });

        this.footstepSound = this.sound.add("footstep-sound", {
            volume: 1,
            loop: true,
        });

        this.hpSeekSuccessSound = this.sound.add("hp-seek-success", {
            volume: 1,
        });

        this.hpSeekFailSound = this.sound.add("hp-seek-fail", {
            volume: 1,
        });

        this.hideSuccessSound = this.sound.add("hide-success-sound", {
            volume: 1,
        });

        this.hideSuccessEffect = this.add
            .sprite(0, 0, "hide-effect")
            .setDisplaySize(50, 50)
            .setOrigin(0.5, 0.5);
        this.hideSuccessEffect.setVisible(false);

        this.itemInstallSuccessEffect = this.add
            .sprite(0, 0, "item-install-effect")
            .setDisplaySize(50, 50)
            .setOrigin(0.5, 0.5);
        this.itemInstallSuccessEffect.setVisible(false);
    }

    isInstallableItem(itemName) {
        return ["BANANA", "BEEHIVE", "POISON_MUSHROOM"].includes(itemName);
    }

    update() {
        if (this.updatePaused) {
            return;
        }
        this.localPlayer.update();
        // 로컬플레이어 포지션 트래킹 , 이후 위치는 x,y,headDir로 접근
        this.roomRepository.getGameRepository().then((gameRepository) => {
            gameRepository.getMe().then(async (me) => {
                const { x, y, headDir } = me.getPosition();
                if (this.hintImages) {
                    for (let direction in this.hintImages) {
                        if (this.hintImages[direction]) {
                            if (direction === "DOWN")
                                this.hintImages[direction].setPosition(
                                    this.localPlayer.x,
                                    this.localPlayer.y + 20
                                );
                            if (direction === "UP")
                                this.hintImages[direction].setPosition(
                                    this.localPlayer.x,
                                    this.localPlayer.y - 20,
                                    direction
                                );
                            if (direction === "LEFT")
                                this.hintImages[direction].setPosition(
                                    this.localPlayer.x - 20,
                                    this.localPlayer.y,
                                    direction
                                );
                            if (direction === "RIGHT")
                                this.hintImages[direction].setPosition(
                                    this.localPlayer.x + 20,
                                    this.localPlayer.y,
                                    direction
                                );
                            if (direction === "UP_LEFT")
                                this.hintImages[direction].setPosition(
                                    this.localPlayer.x - 20,
                                    this.localPlayer.y - 20,
                                    direction
                                );
                            if (direction === "UP_RIGHT")
                                this.hintImages[direction].setPosition(
                                    this.localPlayer.x + 20,
                                    this.localPlayer.y - 20,
                                    direction
                                );
                            if (direction === "DOWN_LEFT")
                                this.hintImages[direction].setPosition(
                                    this.localPlayer.x - 20,
                                    this.localPlayer.y + 20,
                                    direction
                                );
                            if (direction === "DOWN_RIGHT")
                                this.hintImages[direction].setPosition(
                                    this.localPlayer.x + 20,
                                    this.localPlayer.y + 20,
                                    direction
                                );
                        }
                    }
                }
                // 죽었으면 무조건 숨기고 움직임 허용
                if (me.isDead()) {
                    this.localPlayer.visible = false;
                    this.localPlayer.allowMove();
                }
                // 숨는 팀인 경우
                else if (await me.isHidingTeam()) {
                    // 레디 페이즈에
                    if (gameRepository.getCurrentPhase() === Phase.READY) {
                        // 숨었다고 처리 되었으나 화면에 보이고 있으면
                        if (me.isHiding() && this.localPlayer.visible) {
                            // 화면에서 숨기고 움직임 제한
                            this.localPlayer.visible = false;
                            this.localPlayer.disallowMove();
                        }
                        // 아직 안숨었으면
                        else if (!me.isHiding()) {
                            // 화면에 보이게 하고 움직임 허가
                            this.localPlayer.visible = true;
                            this.localPlayer.allowMove();
                        }
                        this.shownHintForCurrentPhase = false;
                    }
                    // 메인 페이즈에
                    else if (gameRepository.getCurrentPhase() === Phase.MAIN) {
                        // 화면에 안보이게 하고 움직임 제한
                        this.localPlayer.visible = false;
                        this.localPlayer.disallowMove();
                    }
                }
                // 찾는 팀인 경우
                else {
                    // 항상 숨어 있지 않은 상태를 보장해주고
                    me.setIsHiding(false);
                    // 레디 페이즈에
                    if (gameRepository.getCurrentPhase() === Phase.READY) {
                        // 화면에 보이게 하고 움직임 제한
                        this.localPlayer.visible = true;
                        this.localPlayer.disallowMove();
                        this.shownHintForCurrentPhase = false;
                        this.roomRepository.setDirectionHints();
                    }
                    // 메인 페이즈에
                    else if (gameRepository.getCurrentPhase() === Phase.MAIN) {
                        // 화면에 보이게 하고 움직임 허가
                        this.localPlayer.visible = true;
                        this.localPlayer.allowMove();

                        if (
                            !this.shownHintForCurrentPhase &&
                            this.roomRepository.getDirectionHints().length !== 0
                        ) {
                            const directionHints =
                                this.roomRepository.getDirectionHints();
                            directionHints.forEach((direction) => {
                                if (!this.hintImages[direction]) {
                                    if (direction === "DOWN")
                                        this.hintImages[direction] =
                                            this.add.image(
                                                this.localPlayer.x,
                                                this.localPlayer.y + 20,
                                                direction
                                            );
                                    if (direction === "UP")
                                        this.hintImages[direction] =
                                            this.add.image(
                                                this.localPlayer.x,
                                                this.localPlayer.y - 20,
                                                direction
                                            );
                                    if (direction === "LEFT")
                                        this.hintImages[direction] =
                                            this.add.image(
                                                this.localPlayer.x - 20,
                                                this.localPlayer.y,
                                                direction
                                            );
                                    if (direction === "RIGHT")
                                        this.hintImages[direction] =
                                            this.add.image(
                                                this.localPlayer.x + 20,
                                                this.localPlayer.y,
                                                direction
                                            );
                                    if (direction === "UP_LEFT")
                                        this.hintImages[direction] =
                                            this.add.image(
                                                this.localPlayer.x - 20,
                                                this.localPlayer.y - 20,
                                                direction
                                            );
                                    if (direction === "UP_RIGHT")
                                        this.hintImages[direction] =
                                            this.add.image(
                                                this.localPlayer.x + 20,
                                                this.localPlayer.y - 20,
                                                direction
                                            );
                                    if (direction === "DOWN_LEFT")
                                        this.hintImages[direction] =
                                            this.add.image(
                                                this.localPlayer.x - 20,
                                                this.localPlayer.y + 20,
                                                direction
                                            );
                                    if (direction === "DOWN_RIGHT")
                                        this.hintImages[direction] =
                                            this.add.image(
                                                this.localPlayer.x + 20,
                                                this.localPlayer.y + 20,
                                                direction
                                            );

                                    this.hintImages[direction].setScale(0.04);

                                    // 2.5초 후에 이미지를 제거
                                    this.time.addEvent({
                                        delay: 2500,
                                        callback: () => {
                                            if (this.hintImages[direction]) {
                                                this.hintImages[
                                                    direction
                                                ].destroy();
                                                this.hintImages[direction] =
                                                    null;
                                            }
                                        },
                                        callbackScope: this,
                                    });
                                }
                            });

                            this.shownHintForCurrentPhase = true;
                        }
                        if (gameRepository.getIsMushroomUsed() === true) {
                            gameRepository.setIsMushroomUsed(false);
                            const directionHints =
                                this.roomRepository.getDirectionHints();
                            directionHints.forEach((direction) => {
                                if (!this.hintImages[direction]) {
                                    if (direction === "DOWN")
                                        this.hintImages[direction] =
                                            this.add.image(
                                                this.localPlayer.x,
                                                this.localPlayer.y + 20,
                                                direction
                                            );
                                    if (direction === "UP")
                                        this.hintImages[direction] =
                                            this.add.image(
                                                this.localPlayer.x,
                                                this.localPlayer.y - 20,
                                                direction
                                            );
                                    if (direction === "LEFT")
                                        this.hintImages[direction] =
                                            this.add.image(
                                                this.localPlayer.x - 20,
                                                this.localPlayer.y,
                                                direction
                                            );
                                    if (direction === "RIGHT")
                                        this.hintImages[direction] =
                                            this.add.image(
                                                this.localPlayer.x + 20,
                                                this.localPlayer.y,
                                                direction
                                            );
                                    if (direction === "UP_LEFT")
                                        this.hintImages[direction] =
                                            this.add.image(
                                                this.localPlayer.x - 20,
                                                this.localPlayer.y - 20,
                                                direction
                                            );
                                    if (direction === "UP_RIGHT")
                                        this.hintImages[direction] =
                                            this.add.image(
                                                this.localPlayer.x + 20,
                                                this.localPlayer.y - 20,
                                                direction
                                            );
                                    if (direction === "DOWN_LEFT")
                                        this.hintImages[direction] =
                                            this.add.image(
                                                this.localPlayer.x - 20,
                                                this.localPlayer.y + 20,
                                                direction
                                            );
                                    if (direction === "DOWN_RIGHT")
                                        this.hintImages[direction] =
                                            this.add.image(
                                                this.localPlayer.x + 20,
                                                this.localPlayer.y + 20,
                                                direction
                                            );

                                    this.hintImages[direction].setScale(0.04);

                                    // 5초 후에 이미지를 제거
                                    this.time.addEvent({
                                        delay: 5000,
                                        callback: () => {
                                            if (this.hintImages[direction]) {
                                                this.hintImages[
                                                    direction
                                                ].destroy();
                                                this.hintImages[direction] =
                                                    null;
                                            }
                                        },
                                        callbackScope: this,
                                    });
                                }
                            });
                        }
                    }
                }

                this.playerMoveHandler.update(this.footstepSound);

                // 플레이어에서 물리적으로 가장 가까운 거리 찾는 객체
                const closest = this.physics.closest(
                    this.localPlayer,
                    this.group.getChildren()
                );

                const minDistance = Phaser.Math.Distance.Between(
                    closest.body.center.x,
                    closest.body.center.y,
                    this.localPlayer.x,
                    this.localPlayer.y
                );

                // 30px 이하로 가까이 있을때 상호작용 표시 로직
                if (minDistance < 30) {
                    if (!this.interactionEffect) {
                        this.interactionEffect = this.add.image(
                            closest.body.center.x,
                            closest.body.center.y - 10,
                            "keycap-space"
                        );
                        this.interactionEffect.setOrigin(0.5, 1);
                        this.interactionEffect.setScale(0.8);
                    } else {
                        // 이미 존재하는 경우 위치만 업데이트
                        this.interactionEffect.setPosition(
                            closest.body.center.x,
                            closest.body.center.y - 10
                        );
                    }
                } else {
                    // 30픽셀 이상 떨어졌을 때 상호작용 효과 제거
                    if (this.interactionEffect) {
                        this.interactionEffect.destroy();
                        this.interactionEffect = null;
                    }
                }
                // 상호작용 표시가 있고, space 키 이벤트 있는 경우
                // 죽어 있는 상태면 상호작용 불가
                if (
                    this.interactionEffect &&
                    isFirstPress(
                        this.m_cursorKeys.space.keyCode,
                        this.m_cursorKeys.space.isDown
                    ) &&
                    !me.isDead()
                ) {
                    const objectId = closest.getData("id");

                    // 숨을 차례이면 숨기 요청
                    if (await me.isHidingTeam()) {
                        // 단, 레디 페이즈에만 숨을 수 있음
                        if (gameRepository.getCurrentPhase() !== Phase.READY) {
                        } else {
                            gameRepository
                                .requestHide(objectId)
                                .then(({ isSucceeded }) => {
                                    if (isSucceeded) {
                                        me.setIsHiding(true);
                                        this.hideSuccessSound.play();

                                        this.hideSuccessEffect.setPosition(
                                            closest.body.x + 10,
                                            closest.body.y - 10
                                        );
                                        this.hideSuccessEffect.setVisible(true);
                                        this.hideSuccessEffect.play(
                                            "hide-effect-animation"
                                        );
                                        this.tweens.add({
                                            targets: this.hideSuccessEffect,
                                            alpha: 0,
                                            duration: 4000,
                                            ease: "Linear",
                                            repeat: 0,
                                            onComplete: () => {
                                                this.hideSuccessEffect.setVisible(
                                                    false
                                                );
                                                this.hideSuccessEffect.stop();
                                            },
                                        });
                                        //숨었을때 로컬플레이어 숨음으로 상태 변경
                                        // this.getGameRepository.getMe().setIsHiding();
                                    } else {
                                        this.text.showTextFailHide(
                                            this,
                                            closest.body.x - 40,
                                            closest.body.y - 40
                                        );
                                    }
                                });
                        }
                    }
                    // 찾을 차례면 탐색 요청
                    else {
                        // 단, 메인 페이즈에만 탐색할 수 있음
                        if (gameRepository.getCurrentPhase() !== Phase.MAIN) {
                        }
                        // 찾을 수 있는 횟수가 남아 있어야 함
                        else if (!me.canSeek()) {
                            // 찾을 수 있는 남은 횟수가 없습니다 메세지
                            this.text.showTextNoAvaiblableCount(
                                this,
                                closest.body.x - 40,
                                closest.body.y - 40
                            );
                        } else {
                            gameRepository
                                .requestSeek(objectId)
                                .then(({ isSucceeded }) => {
                                    if (isSucceeded) {
                                        this.hpSeekSuccessSound.play();

                                        //찾았습니다 메세지
                                        this.text.showTextFind(
                                            this,
                                            closest.body.x - 40,
                                            closest.body.y - 40
                                        );
                                        // 이미지 넣었다가 사라지기
                                        this.showSuccessImage(
                                            closest.body.x + 10,
                                            closest.body.y + 10
                                        );
                                    } else {
                                        this.hpSeekFailSound.play();

                                        if (
                                            gameRepository.getItemAppliedFromObject() ===
                                            "BANANA"
                                        ) {
                                            this.localPlayer.applyItemEffect(
                                                "BANANA"
                                            );
                                            this.time.delayedCall(
                                                5 * 1000,
                                                () => {
                                                    this.localPlayer.removeItemEffect(
                                                        "BANANA"
                                                    );
                                                }
                                            );
                                        } else if (
                                            gameRepository.getItemAppliedFromObject() ===
                                            "BEEHIVE"
                                        ) {
                                            this.localPlayer.applyItemEffect(
                                                "BEEHIVE"
                                            );
                                            this.time.delayedCall(
                                                5 * 1000,
                                                () => {
                                                    this.localPlayer.removeItemEffect(
                                                        "BEEHIVE"
                                                    );
                                                }
                                            );
                                        }
                                        // 독버섯
                                        else if (
                                            gameRepository.getItemAppliedFromObject() ===
                                            "POISON_MUSHROOM"
                                        ) {
                                            this.localPlayer.applyItemEffect(
                                                "POISON_MUSHROOM"
                                            );
                                            this.playerMoveHandler.setReversed(
                                                true
                                            );
                                            setTimeout(() => {
                                                // 이후 set false
                                                this.playerMoveHandler.setReversed(
                                                    false
                                                );
                                                this.localPlayer.removeItemEffect(
                                                    "POISON_MUSHROOM"
                                                );
                                            }, 10 * 1000); // 키반전이 더 빨리 풀리는것같은데 ?
                                        } else {
                                            this.text.showTextFailFind(
                                                this,
                                                closest.body.x - 40,
                                                closest.body.y - 40
                                            );
                                            this.showFailedImage(
                                                closest.body.x + 10,
                                                closest.body.y + 10
                                            );

                                            // 50% 확률로 닭 출현
                                            if (Math.random() < 0.5) {
                                                uiControlQueue.addSurpriseChickenMessage();
                                            }
                                        }
                                    }
                                });
                        }
                    }
                }
                if (
                    gameRepository.getIsEnd() === true &&
                    this.modalShown === false
                ) {
                    this.gameResults = gameRepository.getGameResults();
                    this.winningTeam = gameRepository.getWinningTeam();
                    this.showEndGameModal();
                    this.modalShown = true;

                    // 5초 후에 로비로 이동
                    uiControlQueue.addGameEndMessage(5000);
                    this.time.delayedCall(5000, () => {
                        window.dispatchEvent(
                            new CustomEvent("phaser-route-lobby", {
                                detail: {
                                    path: LOBBY_ROUTE_PATH,
                                    roomNumber:
                                        this.roomRepository.getRoomNumber(),
                                },
                            })
                        );
                    });
                }
                // 아이템 사용 코드
                if (Phaser.Input.Keyboard.JustDown(this.m_cursorKeys.Q)) {
                    if (this.interactionEffect) {
                        // interactionEFFECT있을때 가장 가까운 objectid전달
                        gameRepository
                            .requestItemUse(
                                gameRepository.getItemQ(),
                                closest.getData("id")
                            )
                            .then(({ isSucceeded, speed }) => {
                                if (isSucceeded) {
                                    if (
                                        this.isInstallableItem(
                                            gameRepository.getItemQ()
                                        )
                                    ) {
                                        this.itemInstallSuccessEffect.setPosition(
                                            closest.body.x + 10,
                                            closest.body.y - 10
                                        );
                                        this.itemInstallSuccessEffect.setVisible(
                                            true
                                        );
                                        this.itemInstallSuccessEffect.play(
                                            "item-install-effect-animation"
                                        );
                                        this.tweens.add({
                                            targets:
                                                this.itemInstallSuccessEffect,
                                            alpha: 0,
                                            duration: 2000,
                                            ease: "Linear",
                                            repeat: 0,
                                            onComplete: () => {
                                                this.itemInstallSuccessEffect.setVisible(
                                                    false
                                                );
                                                this.itemInstallSuccessEffect.stop();
                                            },
                                        });
                                    } else {
                                        gameRepository.setItemSpeed(speed);
                                        if (
                                            gameRepository.getItemQ() ===
                                            "RED_PEPPER"
                                        ) {
                                            this.localPlayer.applyItemEffect(
                                                "RED_PEPPER"
                                            );
                                            this.time.delayedCall(
                                                10 * 1000,
                                                () => {
                                                    gameRepository.setItemSpeed(
                                                        200
                                                    );
                                                    this.localPlayer.removeItemEffect(
                                                        "RED_PEPPER"
                                                    );
                                                }
                                            );
                                        } else if (
                                            gameRepository.getItemQ() ===
                                            "MUSHROOM"
                                        ) {
                                            this.localPlayer.applyItemEffect(
                                                "MUSHROOM"
                                            );
                                            this.time.delayedCall(
                                                5 * 1000,
                                                () => {
                                                    gameRepository.setItemSpeed(
                                                        200
                                                    );
                                                    this.localPlayer.removeItemEffect(
                                                        "MUSHROOM"
                                                    );
                                                }
                                            );
                                        }
                                    }
                                }
                            });
                    } else {
                        // interactionEffect 없을때 플레이어 id 전달
                        gameRepository
                            .requestItemUse(
                                gameRepository.getItemQ(),
                                me.getPlayerId()
                            )
                            .then(({ isSucceeded, speed }) => {
                                if (isSucceeded) {
                                    if (
                                        this.isInstallableItem(
                                            gameRepository.getItemQ()
                                        )
                                    ) {
                                        this.itemInstallSuccessEffect.setPosition(
                                            closest.body.x + 10,
                                            closest.body.y - 10
                                        );
                                        this.itemInstallSuccessEffect.setVisible(
                                            true
                                        );
                                        this.itemInstallSuccessEffect.play(
                                            "item-install-effect-animation"
                                        );
                                        this.tweens.add({
                                            targets:
                                                this.itemInstallSuccessEffect,
                                            alpha: 0,
                                            duration: 2000,
                                            ease: "Linear",
                                            repeat: 0,
                                            onComplete: () => {
                                                this.itemInstallSuccessEffect.setVisible(
                                                    false
                                                );
                                                this.itemInstallSuccessEffect.stop();
                                            },
                                        });
                                    } else {
                                        gameRepository.setItemSpeed(speed);
                                        if (
                                            gameRepository.getItemQ() ===
                                            "RED_PEPPER"
                                        ) {
                                            this.localPlayer.applyItemEffect(
                                                "RED_PEPPER"
                                            );
                                            this.time.delayedCall(
                                                10 * 1000,
                                                () => {
                                                    gameRepository.setItemSpeed(
                                                        200
                                                    );
                                                    this.localPlayer.removeItemEffect(
                                                        "RED_PEPPER"
                                                    );
                                                }
                                            );
                                        } else if (
                                            gameRepository.getItemQ() ===
                                            "MUSHROOM"
                                        ) {
                                            this.localPlayer.applyItemEffect(
                                                "MUSHROOM"
                                            );
                                            this.time.delayedCall(
                                                5 * 1000,
                                                () => {
                                                    gameRepository.setItemSpeed(
                                                        200
                                                    );
                                                    this.localPlayer.removeItemEffect(
                                                        "MUSHROOM"
                                                    );
                                                }
                                            );
                                        }
                                    }
                                }
                            });
                    }
                } else if (
                    // W키
                    Phaser.Input.Keyboard.JustDown(this.m_cursorKeys.W)
                ) {
                    if (this.interactionEffect) {
                        // interactionEFFECT있을때 가장 가까운 objectid전달
                        gameRepository
                            .requestItemUse(
                                gameRepository.getItemW(),
                                closest.getData("id")
                            )
                            .then(({ isSucceeded, speed }) => {
                                if (isSucceeded) {
                                    if (
                                        this.isInstallableItem(
                                            gameRepository.getItemW()
                                        )
                                    ) {
                                        this.itemInstallSuccessEffect.setPosition(
                                            closest.body.x + 10,
                                            closest.body.y - 10
                                        );
                                        this.itemInstallSuccessEffect.setVisible(
                                            true
                                        );
                                        this.itemInstallSuccessEffect.play(
                                            "item-install-effect-animation"
                                        );
                                        this.tweens.add({
                                            targets:
                                                this.itemInstallSuccessEffect,
                                            alpha: 0,
                                            duration: 2000,
                                            ease: "Linear",
                                            repeat: 0,
                                            onComplete: () => {
                                                this.itemInstallSuccessEffect.setVisible(
                                                    false
                                                );
                                                this.itemInstallSuccessEffect.stop();
                                            },
                                        });
                                    } else {
                                        gameRepository.setItemSpeed(speed);
                                        if (
                                            gameRepository.getItemW() ===
                                            "RED_PEPPER"
                                        ) {
                                            this.localPlayer.applyItemEffect(
                                                "RED_PEPPER"
                                            );
                                            this.time.delayedCall(
                                                10 * 1000,
                                                () => {
                                                    gameRepository.setItemSpeed(
                                                        200
                                                    );
                                                    this.localPlayer.removeItemEffect(
                                                        "RED_PEPPER"
                                                    );
                                                }
                                            );
                                        } else if (
                                            gameRepository.getItemW() ===
                                            "MUSHROOM"
                                        ) {
                                            this.localPlayer.applyItemEffect(
                                                "MUSHROOM"
                                            );
                                            this.time.delayedCall(
                                                5 * 1000,
                                                () => {
                                                    gameRepository.setItemSpeed(
                                                        200
                                                    );
                                                    this.localPlayer.removeItemEffect(
                                                        "MUSHROOM"
                                                    );
                                                }
                                            );
                                        }
                                    }
                                }
                            });
                    } else {
                        // interactionEffect 없을때 플레이어 id 전달
                        gameRepository
                            .requestItemUse(
                                gameRepository.getItemW(),
                                me.getPlayerId()
                            )
                            .then(({ isSucceeded, speed }) => {
                                if (isSucceeded) {
                                    if (
                                        this.isInstallableItem(
                                            gameRepository.getItemW()
                                        )
                                    ) {
                                        this.itemInstallSuccessEffect.setPosition(
                                            closest.body.x + 10,
                                            closest.body.y - 10
                                        );
                                        this.itemInstallSuccessEffect.setVisible(
                                            true
                                        );
                                        this.itemInstallSuccessEffect.play(
                                            "item-install-effect-animation"
                                        );
                                        this.tweens.add({
                                            targets:
                                                this.itemInstallSuccessEffect,
                                            alpha: 0,
                                            duration: 2000,
                                            ease: "Linear",
                                            repeat: 0,
                                            onComplete: () => {
                                                this.itemInstallSuccessEffect.setVisible(
                                                    false
                                                );
                                                this.itemInstallSuccessEffect.stop();
                                            },
                                        });
                                    } else {
                                        gameRepository.setItemSpeed(speed);
                                        if (
                                            gameRepository.getItemW() ===
                                            "RED_PEPPER"
                                        ) {
                                            this.localPlayer.applyItemEffect(
                                                "RED_PEPPER"
                                            );
                                            this.time.delayedCall(
                                                10 * 1000,
                                                () => {
                                                    gameRepository.setItemSpeed(
                                                        200
                                                    );
                                                    this.localPlayer.removeItemEffect(
                                                        "RED_PEPPER"
                                                    );
                                                }
                                            );
                                        } else if (
                                            gameRepository.getItemW() ===
                                            "MUSHROOM"
                                        ) {
                                            this.localPlayer.applyItemEffect(
                                                "MUSHROOM"
                                            );
                                            this.time.delayedCall(
                                                5 * 1000,
                                                () => {
                                                    gameRepository.setItemSpeed(
                                                        200
                                                    );
                                                    this.localPlayer.removeItemEffect(
                                                        "MUSHROOM"
                                                    );
                                                }
                                            );
                                        }
                                    }
                                }
                            });
                    }
                }

                //update의 repo 끝나는 부분
            });
            // 맵축소
            this.createMapWall();
        });
    }

    showEndGameModal() {
        const gameEndSoundAudio = new Audio("/sounds/effect/etc/ddt.mp3");
        gameEndSoundAudio.play();

        // RPGUI 모달을 표시
        const modalElement = document.getElementById("rpgui-modal");
        modalElement.style.display = "block";

        // 게임 결과를 HTML로 변환
        let resultsHtml = `
        <h3 style="font-size: 1.8em; text-align: center; margin-bottom: 1.2em; margin-top: 1.2em;">
            Game Results - ${this.winningTeam} Win!
        </h3>
        <div style="display: flex; justify-content: space-between;">
            <div style="width: 48%;">
                <h4 style="text-align: center;">Team RACOON</h4>
                <ul style="list-style: none; padding: 0;">
        `;

        // 팀에 따라 결과를 나누어 표시
        this.gameResults.forEach((result) => {
            if (result.team === "RACOON") {
                resultsHtml += `
                    <li style="margin-bottom: 0.9em; margin-right: 1.2em; padding: 0.3em; border: 0.1em solid #ccc; border-radius: 0.3em;">
                        <h2 style="font-size: 0.8em; margin-top: 0.7em;">${result.nickname}</h2>
                        <p style="margin: 0.3em 0; text-align: center; font-size: 0.8em;">
                            <strong>Catches: ${result.catchCount}</strong></br>
                            <strong>Survival Time: ${result.playTime} s</strong>
                        </p>
                    </li>
                `;
            }
        });

        resultsHtml += `
                </ul>
            </div>
            <div style="width: 48%;">
                <h4 style="text-align: center;">Team FOX</h4>
                <ul style="list-style: none; padding: 0;">
        `;

        this.gameResults.forEach((result) => {
            if (result.team === "FOX") {
                resultsHtml += `
                    <li style="margin-bottom: 0.9em; margin-right: 1.2em; padding: 0.3em; border: 0.1em solid #ccc; border-radius: 0.3em;">
                        <h2 style="font-size: 0.8em; margin-top: 0.7em;">${result.nickname}</h2>
                        <p style="margin: 0.3em 0; text-align: center; font-size: 0.8em;">
                            <strong>Catches: ${result.catchCount}</strong></br>
                            <strong>Survival Time: ${result.playTime} s</strong>
                        </p>
                    </li>
                `;
            }
        });

        resultsHtml += `
                </ul>
            </div>
        </div>
        `;

        // 모달 내의 stats-text 요소에 결과 추가
        const statsTextElement = document.getElementById("stats-text");
        if (statsTextElement) {
            statsTextElement.innerHTML = resultsHtml;
        }

        // 로비 버튼 클릭 이벤트
        document.getElementById("lobby-button").onclick = () => {
            this.time.removeAllEvents();

            window.dispatchEvent(
                new CustomEvent("phaser-route-lobby", {
                    detail: {
                        path: LOBBY_ROUTE_PATH,
                        roomNumber: this.roomRepository.getRoomNumber(),
                    },
                })
            );
        };

        // 이전 방으로 돌아가기 버튼 클릭 이벤트
        document.getElementById("back-to-room-button").onclick = () => {
            this.time.removeAllEvents();

            window.dispatchEvent(
                new CustomEvent("phaser-route-back-to-room", {
                    detail: {
                        path: WAITING_ROOM_ROUTE_PATH,
                        roomNumber: this.roomRepository.getRoomNumber(),
                        password: this.roomRepository.getRoomPassword(),
                    },
                })
            );
        };

        // Phaser 씬이 종료될 때 모달을 숨기거나 제거
        this.events.once("shutdown", () => {
            modalElement.style.display = "none";
        });
    }

    // 맵타일단위를 pix로 변환
    tileToPixel(tileCoord) {
        return tileCoord;
    }

    // 맞췄을떄 물체위에 동그라미(success) 이미지 넣는 함수
    showSuccessImage(x, y) {
        const image = this.add.image(x, y, "success");
        image.setDepth(10); //
        // 2초후에 이미지를 페이드 아웃하고 제거
        this.time.delayedCall(2000, () => {
            this.tweens.add({
                targets: image,
                alpha: 0,
                duration: 100, // 페이드아웃 시간
                ease: "Power2", // 천천히 사라지는 애니메이션
                onComplete: () => {
                    image.destroy();
                },
            });
        });
    }
    // 틀렸을때 물체위에 실패(failed) 이미지 넣는 함수
    showFailedImage(x, y) {
        const image = this.add.image(x, y, "failed");
        image.setDepth(10); //
        // 2초후에 이미지를 페이드 아웃하고 제거
        this.time.delayedCall(2000, () => {
            this.tweens.add({
                targets: image,
                alpha: 0,
                duration: 100, // 페이드아웃 시간
                ease: "Power2", // 천천히 사라지는 애니메이션
                onComplete: () => {
                    image.destroy();
                },
            });
        });
    }

    //constructor에 있는 임의의 position 배열에서 좌표 꺼내는 랜덤함수
    updateAnotherPlayerSpritePosition() {
        if (!this.otherPlayerSprites) {
            return;
        }
        for (let otherPlayerSprite of this.otherPlayerSprites) {
            otherPlayerSprite.updatePosition();
            otherPlayerSprite.move(otherPlayerSprite.getHeadDir());
        }
    }

    // 벽 만드는 함수: 시작점과 끝점 받아서 직사각형 모양으로 타일 깔기
    createMapWall() {
        this.roomRepository.getGameRepository().then((gameRepository) => {
            const currentSafeZone = gameRepository.getCurrentSafeZone();
            if (!currentSafeZone) {
                return;
            } // 없으면 리턴

            if (
                this.lastWallPos.x !== currentSafeZone[0] ||
                this.lastWallPos.y !== currentSafeZone[1]
            ) {
                const [startX, startY, endX, endY] = currentSafeZone;
                const tileSize = 32; // 타일의 크기를 고정된 값으로 설정 (예: 32x32 픽셀)

                // 위쪽 벽
                for (let y = 0; y < startY; y += tileSize) {
                    for (let x = 0; x < 1600; x += tileSize) {
                        this.createFogTile(x, y, tileSize);
                    }
                }

                // 아래쪽 벽
                for (let y = endY; y < 1600; y += tileSize) {
                    for (let x = 0; x < 1600; x += tileSize) {
                        this.createFogTile(x, y, tileSize);
                    }
                }

                // 왼쪽 벽
                for (let x = 0; x < startX; x += tileSize) {
                    for (let y = startY; y < endY; y += tileSize) {
                        this.createFogTile(x, y, tileSize);
                    }
                }

                // 오른쪽 벽
                for (let x = endX; x < 1600; x += tileSize) {
                    for (let y = startY; y < endY; y += tileSize) {
                        this.createFogTile(x, y, tileSize);
                    }
                }

                // 현재 맵의 경계를 저장
                this.lastWallPos = {
                    x: startX,
                    y: startY,
                };
            }
        });
    }

    createFogTile(x, y, tileSize) {
        if (this.#isAlreadyFogCreatedCoordinate(x, y)) {
            return;
        }
        this.#createdFogTileCoordinates.push({ x, y });

        const alpha = 0.4;
        const width = tileSize;
        const height = tileSize;

        const fogTile = this.add.image(x, y, "fog-image");
        fogTile.setDisplaySize(width, height);
        fogTile.setAlpha(alpha);

        // 안개 타일 애니메이션 효과
        this.tweens.add({
            targets: fogTile,
            alpha: { from: 0, to: alpha },
            duration: 1000,
            ease: "Linear",
        });
    }
}
