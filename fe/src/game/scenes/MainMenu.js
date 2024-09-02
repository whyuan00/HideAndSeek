import { Scene } from 'phaser';

export class MainMenu extends Phaser.Scene
{
    constructor ()
    {
        super('MainMenu');
    }

    preload(){
        // 여기서 map에 접근
    }
    create ()
    {

        // 맵 미리보기나 다른 용도로 맵 데이터 사용
        //게임 시작 전에 거쳐가는 씬으로 사용가능 
        // this.createMinimap(map, layers);
    }
}

export default MainMenu;
