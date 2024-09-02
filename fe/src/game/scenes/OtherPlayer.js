import Phaser from "phaser";
import { getRoomRepository } from "../../repository";
import { Phase } from "../../repository/_game";

export default class OtherPlayerSprite extends Phaser.Physics.Arcade.Sprite {
    static PLAYER_SPEED = 200;
    static moveX = [0, 1, 0, -1];
    static moveY = [-1, 0, 1, 0];

    #player;

    constructor(scene, x, y, texture, id) {
        super(scene, x, y, texture);

        this.id = id;
        this.#player = getRoomRepository().getPlayerWithId(id);
        this.scale = 1;
        this.alpha = 1;
        this.setDepth(10); //화면 제일 앞에 렌더링

        scene.add.existing(this);
        scene.physics.add.existing(this);

        // 스프라이트의 표시 크기를 1px * 1px로 설정
        this.setDisplaySize(16, 16);
        // 물리 바디의 크기를 1px * 1px로 설정
        this.body.setSize(28, 28);

        this.roomRepository = getRoomRepository();
        this.roomRepository.getGameRepository().then(async (gameRepository) => {
            //id로 player초기화
            this._player = gameRepository.getPlayerWithId(id);
            this.isRacoon = await this._player.isRacoonTeam();
            this.setupAnimations();
        });

        this.isMoving = false;
        this.footstepSound = new Audio(
            "sounds/effect/minifantasy/16_human_walk_stone_2.wav"
        );
        this.footstepSound.loop = true;
    }

    playFootstepSound() {}

    stopFootstepSound() {}

    //애니메이션
    setupAnimations() {
        //racoon animation
        if (this.isRacoon) {
            this.anims.create({
                key: "racoon-idle-down",
                frames: this.anims.generateFrameNames("racoon", {
                    start: 1,
                    end: 2,
                    prefix: "idle-down-",
                    suffix: ".png",
                }),
                repeat: -1,
                frameRate: 5,
            });

            this.anims.create({
                key: "racoon-idle-right",
                frames: this.anims.generateFrameNames("racoon", {
                    start: 1,
                    end: 2,
                    prefix: "idle-right-",
                    suffix: ".png",
                }),
                repeat: -1,
                frameRate: 1,
            });
            this.anims.create({
                key: "racoon-idle-left",
                frames: this.anims.generateFrameNames("racoon", {
                    start: 1,
                    end: 2,
                    prefix: "idle-left-",
                    suffix: ".png",
                }),
                repeat: -1,
                frameRate: 1,
            });

            this.anims.create({
                key: "racoon-idle-up",
                frames: this.anims.generateFrameNames("racoon", {
                    start: 1,
                    end: 2,
                    prefix: "idle-up-",
                    suffix: ".png",
                }),
                repeat: -1,
                frameRate: 1,
            });

            this.anims.create({
                key: "racoon-run-down",
                frames: this.anims.generateFrameNames("racoon", {
                    start: 1,
                    end: 4,
                    prefix: "run-down-",
                    suffix: ".png",
                }),
                repeat: -1,
                frameRate: 10,
            });

            this.anims.create({
                key: "racoon-run-up",
                frames: this.anims.generateFrameNames("racoon", {
                    start: 1,
                    end: 4,
                    prefix: "run-up-",
                    suffix: ".png",
                }),
                repeat: -1,
                frameRate: 10,
            });

            this.anims.create({
                key: "racoon-run-right",
                frames: this.anims.generateFrameNames("racoon", {
                    start: 1,
                    end: 4,
                    prefix: "run-right-",
                    suffix: ".png",
                }),
                repeat: -1,
                frameRate: 10,
            });
            this.anims.create({
                key: "racoon-run-left",
                frames: this.anims.generateFrameNames("racoon", {
                    start: 1,
                    end: 4,
                    prefix: "run-left-",
                    suffix: ".png",
                }),
                repeat: -1,
                frameRate: 10,
            });

            this.anims.play("racoon-idle-down");
        } else if (!this.isRacoon) {
            this.anims.create({
                key: "fox-idle-down",
                frames: this.anims.generateFrameNames("fox", {
                    start: 1,
                    end: 2,
                    prefix: "idle-down-",
                    suffix: ".png",
                }),
                repeat: -1,
                frameRate: 1,
            });

            this.anims.create({
                key: "fox-idle-right",
                frames: this.anims.generateFrameNames("fox", {
                    start: 1,
                    end: 2,
                    prefix: "idle-right-",
                    suffix: ".png",
                }),
                repeat: -1,
                frameRate: 1,
            });
            this.anims.create({
                key: "fox-idle-left",
                frames: this.anims.generateFrameNames("fox", {
                    start: 1,
                    end: 2,
                    prefix: "idle-left-",
                    suffix: ".png",
                }),
                repeat: -1,
                frameRate: 5,
            });

            this.anims.create({
                key: "fox-idle-up",
                frames: this.anims.generateFrameNames("fox", {
                    start: 1,
                    end: 2,
                    prefix: "idle-up-",
                    suffix: ".png",
                }),
                repeat: -1,
                frameRate: 1,
            });

            this.anims.create({
                key: "fox-run-down",
                frames: this.anims.generateFrameNames("fox", {
                    start: 1,
                    end: 4,
                    prefix: "run-down-",
                    suffix: ".png",
                }),
                repeat: -1,
                frameRate: 10,
            });

            this.anims.create({
                key: "fox-run-up",
                frames: this.anims.generateFrameNames("fox", {
                    start: 1,
                    end: 4,
                    prefix: "run-up-",
                    suffix: ".png",
                }),
                repeat: -1,
                frameRate: 10,
            });

            this.anims.create({
                key: "fox-run-right",
                frames: this.anims.generateFrameNames("fox", {
                    start: 1,
                    end: 4,
                    prefix: "run-right-",
                    suffix: ".png",
                }),
                repeat: -1,
                frameRate: 10,
            });
            this.anims.create({
                key: "fox-run-left",
                frames: this.anims.generateFrameNames("fox", {
                    start: 1,
                    end: 4,
                    prefix: "run-left-",
                    suffix: ".png",
                }),
                repeat: -1,
                frameRate: 10,
            });

            this.anims.play("fox-idle-down");
        }
    }

    move(headDir) {
        if (this.isRacoon) {
            // 애니메이션 업데이트
            if (headDir === 0) {
                // Up
                this.anims.play("racoon-run-up");
            } else if (headDir === 1) {
                // Right
                this.anims.play("racoon-run-right");
            } else if (headDir === 2) {
                // Down
                this.anims.play("racoon-run-down");
            } else if (headDir === 3) {
                // Left
                this.anims.play("racoon-run-left");
            }
        } else {
            if (headDir === 0) {
                // Up
                this.anims.play("fox-run-up");
            } else if (headDir === 1) {
                // Right
                this.anims.play("fox-run-right");
            } else if (headDir === 2) {
                // Down
                this.anims.play("fox-run-down");
            } else if (headDir === 3) {
                // Left
                this.anims.play("fox-run-left");
            }
        }
    }

    stopMove(headDir) {
        if (this.isRacoon) {
            // 애니메이션 업데이트
            if (headDir === 0) {
                // Up
                this.anims.play("racoon-run-up");
            } else if (headDir === 1) {
                // Right
                this.anims.play("racoon-run-right");
            } else if (headDir === 2) {
                // Down
                this.anims.play("racoon-run-down");
            } else if (headDir === 3) {
                // Left
                this.anims.play("racoon-run-left");
            }
        } else {
            if (headDir === 0) {
                // Up
                this.anims.play("fox-run-up");
            } else if (headDir === 1) {
                // Right
                this.anims.play("fox-run-right");
            } else if (headDir === 2) {
                // Down
                this.anims.play("fox-run-down");
            } else if (headDir === 3) {
                // Left
                this.anims.play("fox-run-left");
            }
        }
    }
    // phase 에 따른 움직임 추가
    // 내가 하이딩팀일때/ otherplayer 가 하이딩팀일 때
    // 언제 otherplayter 화면에 보여지고 안보여지는
    // phaser 따라서 구분.

    // 만약에 나: 하이딩 상대방: 하이딩 -> 상대방보임
    // 나: 찾 상대방:하이딩 -> this._player.visibel == false (if phase==숨는시간)

    getPosition() {
        const position = this.#player.getPosition();
        return { x: position.x, y: position.y, direction: position.direction };
    }

    updatePosition() {
        const position = this.roomRepository
            .getPlayerWithId(this.#player.getPlayerId())
            .getPosition();
        this.x = position.x;
        this.y = position.y;
    }

    getHeadDir() {
        const direction = this.#player.getPosition().direction;
        switch (direction) {
            case "UP":
                return 0;
            case "RIGHT":
                return 1;
            case "DOWN":
                return 2;
            case "LEFT":
                return 3;
        }
    }
}
