import { Group } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import MODEL from './finish.glb';

class Checkpoint8 extends Group {
    constructor(positionToMiles, miles) {
        // Call parent Group() constructor
        super();

        const loader = new GLTFLoader();

        this.name = 'checkpoint';

        loader.load(MODEL, (gltf) => {
            this.add(gltf.scene);
        });
        this.scale.set(0.01, 0.01, 0.01);
        this.position.x = 5;
        this.position.z = -1 * positionToMiles * miles;
        this.rotation.y = Math.PI/2;
    }
}

export default Checkpoint8;
