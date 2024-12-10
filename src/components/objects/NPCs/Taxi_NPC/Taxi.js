import { Group, Box3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import TAXI_MODEL from './Taxi.glb';

class Taxi_NPC extends Group {
    constructor(lane, chunk) {
        // Call parent Group() constructor
        super();

        const loader = new GLTFLoader();

        this.name = 'taxi_npc';

        loader.load(TAXI_MODEL, (gltf) => {
            this.add(gltf.scene);
        });
        this.scale.set(0.017, 0.017, 0.017);
        this.rotation.y = Math.PI;
        this.position.y = 0.05;
        this.position.x = 0.5 + lane;
        this.mass = 1;
        this.restingZSpeed = this.getRandomSpeed();
        this.z_speed = 0;
        this.x_speed = 0;
        this.position.z = -1 * this.getRandomZ(chunk); // Generate random z-position based on chunk
        this.boundingBox = new Box3(); // Bounding box for the player
    }

    getRandomZ(chunk) {
        // Calculate the start and end of the range for the chunk
        const chunkStart = (chunk - 1) * 39.49791; // Each chunk is 40 units
        const chunkEnd = chunk * 39.49791 - 1;

        // Generate a random number within the range [chunkStart, chunkEnd]
        return Math.random() * (chunkEnd - chunkStart) + chunkStart;
    }

    getRandomSpeed() {
        return Math.random() * (0.3 - 0.1) + 0.1;
    }

    getCurrentChunk() {
        const chunkSize = 39.49791; // Defined chunk size
        return Math.floor(this.position.z / chunkSize);
    }

    remove() {
        if (this.parent) {
            this.parent.remove(this); // Remove the NPC from its parent group
        }
    }    

    updateBoundingBox() {
        // Compute the bounding box of the player
        this.boundingBox.setFromObject(this);
    }

    getBoundingBox() {
        return this.boundingBox.clone();
    }
}


export default Taxi_NPC; 