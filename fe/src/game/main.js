import Phaser, { Physics } from "phaser";
import { MainMenu } from "./scenes/MainMenu";
import { Preloader } from "./scenes/Preloader";
import { game } from "./scenes/Game";
import GameUI from "./scenes/GameUI";
import { useEffect } from "react";

const config = {
    type: Phaser.CANVAS,
    width: 400,
    height: 250,
    parent: "game-container",
    backgroundColor: "#000000",
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [Preloader, MainMenu, game, GameUI],
    physics: {
        default: "arcade",
    },
    fps: {
        min: 30,
        target: 30,
        forceSetTimeOut: true,
    },
    roundPixels: true,
    pixelArt: true,
};

const StartGame = (parent) => {
    return new Phaser.Game({ ...config, parent });
};

export default StartGame;

