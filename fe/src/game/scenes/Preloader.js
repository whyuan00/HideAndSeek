import { Scene } from "phaser";
import Phaser from "phaser";
export class Preloader extends Scene {
    constructor() {
        super("preloader");
    }
    preload() {
        //캐릭터 이미지, 이후 player로 분리할것.
        this.load.atlas(
            "racoon",
            "assets/character/image.png",
            "assets/character/racoon.json"
        );
        this.load.atlas(
            "fox",
            "assets/character/fox.png",
            "assets/character/fox.json"
        );

        // map 이미지 로드
        this.load.tilemapTiledJSON(
            "map-2024-07-29",
            "/assets/map/map-2024-07-29.json"
        );
        this.load.image("tiles", "/assets/map/map-2024-07-29_tiles.png");
        this.load.image("base", "/assets/map/base.png");

        // 상호작용 확인할 오크통&상호작용 표시 이미지 로드
        this.load.image("oak", "assets/object/oak.png");
        this.load.image(
            "interactionEffect",
            "assets/object/interactionEffect.png"
        );

        // 화살표 이미지 로드
        this.load.image("DOWN_LEFT", "assets/object/down_left.png");
        this.load.image("DOWN_RIGHT", "assets/object/down_right.png");
        this.load.image("UP_LEFT", "assets/object/up_left.png");
        this.load.image("UP_RIGHT", "assets/object/up_right.png");
        this.load.image("UP", "assets/object/up.png");
        this.load.image("LEFT", "assets/object/left.png");
        this.load.image("RIGHT", "assets/object/right.png");
        this.load.image("DOWN", "assets/object/down.png");

        // 캐릭터 발자국 소리
        this.load.audio(
            "footstep-sound",
            "sounds/effect/minifantasy/16_human_walk_stone_2.wav"
        );

        // 닭소리
        this.load.audio(
            "surprising-chicken",
            "sounds/effect/custom/surprising-chicken.mp3"
        );

        // 닭 머리
        this.load.image("chicken-head-1", "image/chicken-head-1.png");

        //로딩중 텍스트메세지
        this.loadingText = this.add
            .text(
                this.cameras.main.centerX,
                this.cameras.main.centerY,
                "LOADING...",
                {
                    fontFamily: '"Press Start 2P", cursive',
                    fontSize: "36px",
                    fill: "#000",
                    align: "center",
                    stroke: "#fff",
                    strokeThickness: 4,
                }
            )
            .setOrigin(0.5, 0.5);

        // 로딩 화면 배경색
        this.cameras.main.setBackgroundColor("#028af8");

        // HP 탐색 성공
        this.load.audio(
            "hp-seek-success",
            "sounds/effect/etc/hp-seek-success.mp3"
        );

        // HP 탐색 실패
        this.load.audio("hp-seek-fail", "sounds/effect/etc/hp-seek-fail.wav");

        // 숨기 성공
        this.load.audio(
            "hide-success-sound",
            "sounds/effect/etc/open-door.mp3"
        );
        // 남은 시간 타이머
        this.load.image("timer-background", "assets/ui/timer.png");

        // 좁혀지는 벽 이미지
        this.load.image("fog-image", "assets/effect/fog.png");

        // 고추 아이템 적용 효과 : 속도 빨라짐
        this.load.image("pepper", "assets/object/item/pepperItem.png");
        this.load.spritesheet({
            key: "dynamic-pepper-effect",
            url: "assets/effect/Fire+Sparks-Sheet.png",
            frameConfig: {
                frameWidth: 96,
                frameHeight: 96,
                startFrame: 0,
                endFrame: 18,
            },
        });

        this.load.audio(
            "pepper-effect-sound",
            "sounds/effect/etc/pepper-effect.mp3"
        );

        // 방향 버섯 아이템 적용 효과 : 다른 플레이어 위치 화살표 다시 보여줌
        this.load.image("mushroom", "assets/object/item/mushroomItem.png");
        this.load.spritesheet({
            key: "dynamic-mushroom-effect",
            url: "assets/effect/S001_nyknck.png",
            frameConfig: {
                frameWidth: 32,
                frameHeight: 32,
                startFrame: 0,
                endFrame: 3,
            },
        });

        // 바나나 아이템 적용 효과: 속도 감소
        this.load.image("banana", "assets/object/item/bananaItem.png");

        // 벌통: 속도 0(멈춤)
        this.load.image("beeHive", "assets/object/item/beehiveItem.png");
        this.load.spritesheet({
            key: "dynamic-bee-hive-effect",
            url: "assets/effect/Bee_Attack.png",
            frameConfig: {
                frameWidth: 64,
                frameHeight: 64,
                startFrame: 0,
                endFrame: 15,
            },
        });

        // 독버섯: 키반전
        this.load.image(
            "poisonMushroom",
            "assets/object/item/poisonMushroomItem.png"
        );
        this.load.spritesheet({
            key: "dynamic-poison-mushroom-effect",
            url: "assets/effect/Retro Impact Effect Pack 5 B.png",
            frameConfig: {
                frameWidth: 64,
                frameHeight: 45,
                startFrame: 0,
                endFrame: 8,
            },
        });

        // 나뭇잎: 다른 물체로 변신

        // 키캡 이미지
        this.load.image("keycap-Q", "assets/ui/keycaps/Q.png");
        this.load.image("keycap-W", "assets/ui/keycaps/W.png");
        this.load.image("keycap-space", "assets/ui/keycaps/space.png");

        // 나뭇잎 흩날리는 이펙트
        this.load.spritesheet({
            key: "leaf-fullscreen-effect",
            url: "assets/effect/Leaves-Sheet.png",
            frameConfig: {
                frameWidth: 250,
                frameHeight: 150,
                startFrame: 0,
                endFrame: 16,
            },
        });

        // 숨기 이펙트
        this.load.spritesheet({
            key: "hide-effect",
            url: "assets/effect/hide-effect.png",
            frameConfig: {
                frameWidth: 64,
                frameHeight: 71,
                startFrame: 0,
                endFrame: 15,
            },
        });

        // 아이템 설치 성공 이펙트
        this.load.spritesheet({
            key: "item-install-effect",
            url: "assets/effect/Gravity-Sheet.png",
            frameConfig: {
                frameWidth: 96,
                frameHeight: 80,
                startFrame: 0,
                endFrame: 19,
            },
        });
    }

    create() {
        this.scene.start("game");

        this.anims.create({
            key: "dynamic-pepper-effect-animation",
            frames: this.anims.generateFrameNumbers("dynamic-pepper-effect", {
                start: 0,
                end: 18,
            }),
            frameRate: 20,
            repeat: -1,
        });

        this.anims.create({
            key: "dynamic-mushroom-effect-animation",
            frames: this.anims.generateFrameNumbers("dynamic-mushroom-effect", {
                start: 0,
                end: 3,
            }),
            frameRate: 5,
            repeat: -1,
        });

        this.anims.create({
            key: "dynamic-bee-hive-effect-animation",
            frames: this.anims.generateFrameNumbers("dynamic-bee-hive-effect", {
                start: 0,
                end: 15,
            }),
            frameRate: 10,
            repeat: -1,
        });

        this.anims.create({
            key: "dynamic-poison-mushroom-effect-animation",
            frames: this.anims.generateFrameNumbers(
                "dynamic-poison-mushroom-effect",
                {
                    start: 0,
                    end: 8,
                }
            ),
            frameRate: 10,
            repeat: -1,
        });

        this.anims.create({
            key: "leaf-fullscreen-effect-animation",
            frames: this.anims
                .generateFrameNumbers("leaf-fullscreen-effect", {
                    start: 0,
                    end: 9,
                })
                .map((frame) => ({ ...frame, delay: 500 })), // Add a delay of 100ms between frames
            frameRate: 10,
            repeat: -1,
        });

        this.anims.create({
            key: "hide-effect-animation",
            frames: this.anims.generateFrameNumbers("hide-effect", {
                start: 0,
                end: 15,
            }),
            frameRate: 10,
            repeat: -1,
        });

        this.anims.create({
            key: "item-install-effect-animation",
            frames: this.anims.generateFrameNumbers("item-install-effect", {
                start: 0,
                end: 19,
            }),
            frameRate: 10,
            repeat: -1,
        });
    }
}
