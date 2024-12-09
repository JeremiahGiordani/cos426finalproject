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
        this.modelTemplate = null; // Cached model for reuse
    }

    async loadModelTemplate() {
        return new Promise((resolve, reject) => {
            this.loader.load(
                MODEL,
                (gltf) => {
                    this.modelTemplate = gltf.scene;
                    console.log("Model template loaded");
                    resolve();
                },
                undefined,
                (error) => {
                    console.error("Error loading model template:", error);
                    reject(error);
                }
            );
        });
    }

    addSegment(chunkNumber) {
        return new Promise((resolve, reject) => {
            if (!this.modelTemplate) {
                reject(new Error("Model template not loaded"));
                return;
            }

            const zOffset = -chunkNumber * this.chunkLength;

            // Clone the cached model for the new chunk
            const roadModel = this.modelTemplate.clone();

            // Position and scale the cloned model
            roadModel.scale.set(0.01, 0.01, 0.01);
            roadModel.rotation.y = Math.PI / 2;
            roadModel.position.z = zOffset;

            // Add the cloned model to the group and track it
            this.add(roadModel);
            this.segments.push({ chunk: chunkNumber, model: roadModel });

            console.log(`Chunk ${chunkNumber} added`);
            resolve();
        });
    }

    removeOldSegment() {
        if (this.segments.length > 0) {
            const { model } = this.segments.shift();
            this.remove(model);
            console.log("Oldest chunk removed");
        }
    }
}

export default Road;
