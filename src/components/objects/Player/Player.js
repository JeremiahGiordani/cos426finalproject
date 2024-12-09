import { Group, Box3, Box3Helper } from 'three';
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

        this.boundingBox = new Box3(); // Bounding box for the player
        this.boundingBoxHelper = null;
    }

    updateBoundingBox() {
        // Compute the bounding box of the player
        this.boundingBox.setFromObject(this);

        // Optionally, visualize the bounding box for debugging
        if (!this.boundingBoxHelper) {
            this.boundingBoxHelper = new Box3Helper(this.boundingBox, 0xffff00);
            this.add(this.boundingBoxHelper);
        } else {
            // Update the helper to match the bounding box
            this.boundingBoxHelper.box.copy(this.boundingBox);
        }
    }

    getBoundingBox() {
        return this.boundingBox.clone();
    }
}

export default Player;
