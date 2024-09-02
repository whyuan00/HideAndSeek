import Phaser from "phaser";

export default class TextGroup extends Phaser.GameObjects.Group {
    constructor() {
        super(TextGroup);
        this.styles = {
            style1: { fontSize: 10, fontFamily: "Galmuri11", fill: "#F8EDED" }, // 흰글씨, 숨기 승인
            style2: { fontSize: 10, fontFamily: "Galmuri11", fill: "#B43F3F" }, // 빨간글씨, 워닝
            style3: { fontSize: 10, fontFamily: "Galmuri11", fill: "#173B45" }, // 중간, 상황 알림
        };
    }
    // 이후 아이템 배치 불가 추가
    showTextHide(scene, x, y) {
        const text = scene.add.text(x, y, "숨었습니다!", this.styles.style1);
        this.add(text);

        scene.time.addEvent({
            delay: 500,
            callback: () => {
                text.destroy();
            },
        });
    }

    showTextFailHide(scene, x, y) {
        const text = scene.add.text(
            x,
            y,
            "이 곳에는 숨을 수 없습니다!",
            this.styles.style3
        );
        this.add(text);

        scene.time.addEvent({
            delay: 500,
            callback: () => {
                text.destroy();
            },
        });
    }
    showTextFarToHide(scene, x, y) {
        const text = scene.add.text(
            x,
            y,
            "더 가까이 가야 숨을 수 있습니다",
            this.styles.style3
        );
        this.add(text);

        scene.time.addEvent({
            delay: 500,
            callback: () => {
                text.destroy();
            },
        });
    }
    showTextFarToFind(scene, x, y) {
        const text = scene.add.text(
            x,
            y,
            "더 가까이 가야 찾을 수 있습니다",
            this.styles.style3
        );
        this.add(text);

        scene.time.addEvent({
            delay: 500,
            callback: () => {
                text.destroy();
            },
        });
    }

    showTextFind(scene, x, y) {
        //플레이어 화면의 중간에 띄울 예정
        const text = scene.add.text(x, y, "찾았습니다!", this.styles.style3);
        this.add(text);

        scene.time.addEvent({
            delay: 500,
            callback: () => {
                text.destroy();
            },
        });
    }

    showTextFailFind(scene, x, y) {
        // 항상 플레이어 화면의 중간에 띄울예정
        const text = scene.add.text(
            x,
            y,
            "여기 숨은 사람이 없습니다!",
            this.styles.style2
        );
        this.add(text);

        scene.time.addEvent({
            delay: 500,
            callback: () => {
                text.destroy();
            },
        });
    }
    showTextNoAvaiblableCount(scene, x, y) {
        const text = scene.add.text(
            x,
            y,
            "찾을 수 있는 남은 횟수가 없습니다",
            this.styles.style3
        );
        this.add(text);

        scene.time.addEvent({
            delay: 500,
            callback: () => {
                text.destroy();
            },
        });
    }
}

