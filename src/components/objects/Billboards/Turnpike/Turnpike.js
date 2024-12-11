import { Group } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import MODEL from './SV_Billboard.glb';

class Turnpike extends Group {
    constructor() {
        // Call parent Group() constructor
        super();

        const loader = new GLTFLoader();

        this.name = 'billboard';

        loader.load(MODEL, (gltf) => {
            this.add(gltf.scene);
        });
        this.scale.set(0.01, 0.01, 0.01);
        this.position.x = 5;
        this.position.z = -30;
        this.rotation.y = Math.PI/2;
        // this.position.y = ;
    }
}

export default Turnpike;
