export default class MapTile {
    constructor(scene) {
        this.scene = scene;
        this.map = null;
        this.tileset = null;
        this.layers = {};
    }

    createMap(mapKey, tilesetName, tilesetKey) {
        this.map = this.scene.make.tilemap({ key: mapKey });
        this.tileset = this.map.addTilesetImage(tilesetName, tilesetKey);

        //layer이름 하드코딩 해놨음, 고쳐야함 
        this.layers = {
            BackGround: this.map.createLayer("BackGround", this.tileset, 0, 0),
            Ground: this.map.createLayer("Ground", this.tileset, 0, 0),
            BackGround_Of_Wall: this.map.createLayer(
                "Background-Of-Wall",
                this.tileset,
                0,
                0
            ),
            Walls: this.map.createLayer("Walls", this.tileset, 0, 0),
            HP: this.map.createLayer("HP", this.tileset, 0, 0),
            
        };
        return this;
    }
    
    createFloatingMap(){
        this.map.createLayer("Floatings", this.tileset, 0, 0)
    }

    createHP(){
        return this.map.objects[0].objects
    }

    setupCollisions() {
        this.layers.BackGround.setCollisionBetween(1, 100, true, false);
        this.layers.BackGround_Of_Wall.setCollisionBetween(1, 100, true, false);
        this.layers.Walls.setCollisionBetween(1, 100, true, false);
        this.layers.HP.setCollisionBetween(1, 100, true, false);

        return this;
    }

    getObjects() {
        return this.objectsGroup;
    }

    getMap() {
        return this.map;
    }

    getLayers() {
        return this.layers;
    }

    getTileset() {
        return this.tileset;
    }
}
