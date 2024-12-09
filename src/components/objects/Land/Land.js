import { Group } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import MODEL from './land.gltf';

class Land extends Group {
    constructor() {
        // Call parent Group() constructor
        super();

        const loader = new GLTFLoader();

        this.name = 'land';

        loader.load(MODEL, (gltf) => {
            this.add(gltf.scene);
        });
        this.position.x = -5;
        this.position.z = -20;
        this.rotation.y = 2700;
    }
}

export default Land;
