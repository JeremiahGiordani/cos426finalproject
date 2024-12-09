import { Group } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import MODEL from './road_straight.glb';

class Road extends Group {
    constructor() {
        super();

        this.name = 'road';
        this.segments = []; // Track existing road segments
        this.loader = new GLTFLoader();
        this.chunkLength = 39.49791; // Length of one chunk
    }

    addSegment(chunkNumber) {
        const zOffset = -chunkNumber * this.chunkLength;

        this.loader.load(
            MODEL,
            (gltf) => {
                const roadModel = gltf.scene;

                // Scale and rotate the road segment
                roadModel.scale.set(0.01, 0.01, 0.01);
                roadModel.rotation.y = Math.PI / 2;

                // Position the segment at the calculated z offset
                roadModel.position.z = zOffset;

                // Add the segment to the group and track it
                this.add(roadModel);
                this.segments.push({ chunk: chunkNumber, model: roadModel });
            },
            undefined,
            (error) => {
                console.error(`Error loading road segment for chunk ${chunkNumber}:`, error);
            }
        );
    }

    removeOldSegment() {
        // Remove the first segment in the list
        if (this.segments.length > 0) {
            const { model } = this.segments.shift();
            this.remove(model);
        }
    }
}

export default Road;
