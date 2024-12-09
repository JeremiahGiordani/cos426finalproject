import { Group } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import MODEL from './player.glb';

class Player extends Group {
    constructor() {
        // Call parent Group() constructor
        super();

        const loader = new GLTFLoader();

        this.name = 'player';

        loader.load(MODEL, (gltf) => {
            this.add(gltf.scene);
        });
        this.scale.set(0.8, 0.8, 0.8);
        this.position.y = 0.25;
    }
}

export default Player;
