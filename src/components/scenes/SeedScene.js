import { Scene, Color } from 'three';
import { Road, Player } from 'objects';
import { BasicLights } from 'lights';
import { Old_Car_NPC, Car_2_NPC, Cop_NPC, Fire_Truck_NPC, Taxi_NPC, Bus_NPC, Truck_NPC, Ambulance_NPC, Car_NPC } from '../objects';

class SeedScene extends Scene {
    constructor() {
        // Call parent Scene() constructor
        super();

        // Init state
        this.state = {
            // gui: new Dat.GUI(), // Create GUI for scene
            rotationSpeed: 1,
            updateList: [],
            x_speed: 0, // Initial speed in x direction
            z_speed: 0, // Initial speed in z direction
            acceleration: 0.002, // Acceleration when keys are pressed
            maxSpeed: 0.5, // Maximum speed limit
            health: 100,
            currentChunk: 0, // Chunk the player is currently on
            renderDistance: 5, // Number of chunks to render ahead
            npcs: [],
            opposing_npcs: [],
        };

        // Set background to a nice color
        this.background = new Color(0x7ec0ee);

        // Add meshes to scene
        this.road = new Road();
        const lights = new BasicLights();
        this.player = new Player();
        // this.addToUpdateList(this.player);
        // Add NPC car and track it
        this.add(this.road, lights, this.player);

        // Add keyboard event listeners
        this.addKeyboardControls();

        // Dynamically create the health bar
        this.createHealthBar();

        // Initialize road
        this.initRoad();

        this.position.x = -2.5
        this.player.position.x = 2.5
        this.npcTypes = [Old_Car_NPC, Car_2_NPC, Cop_NPC, Fire_Truck_NPC, Taxi_NPC, Bus_NPC, Truck_NPC, Ambulance_NPC, Car_NPC];
    }

    addToUpdateList(object) {
        this.state.updateList.push(object);
    }

    async initRoad() {
        // Load the model template once
        await this.road.loadModelTemplate();
    
        // Add initial road chunks
        for (let chunk = 0; chunk < this.state.renderDistance; chunk++) {
            // Add road segment for the chunk
            await this.road.addSegment(chunk);
    
            // For each lane in the chunk, add a random NPC
            for (let lane = 0; lane < 3; lane++) { // Assuming 3 lanes
                // Pick a random NPC type
                const RandomNPC = this.npcTypes[Math.floor(Math.random() * this.npcTypes.length)];
    
                // Create the NPC instance
                const npc = new RandomNPC(lane + 1, chunk + 1);
    
                // Add the NPC to the state and the scene
                this.state.npcs.push(npc);
                this.add(npc);
            }
            for (let lane = 0; lane < 3; lane++) { // Assuming 3 lanes
                // Pick a random NPC type
                const RandomNPC = this.npcTypes[Math.floor(Math.random() * this.npcTypes.length)];
    
                // Create the NPC instance
                const npc = new RandomNPC(lane + 1, chunk + 1);
                npc.rotation.y += Math.PI;
                npc.position.x *= -1;
    
                // Add the NPC to the state and the scene
                this.state.opposing_npcs.push(npc);
                this.add(npc);
            }
        }
    }

    async updateRoad() {
        const { renderDistance } = this.state;
    
        // Calculate the current chunk based on the player's position
        const currentChunk = Math.floor(this.position.z / this.road.chunkLength) - 1;
    
        // If the player has advanced to a new chunk
        if (currentChunk > this.state.currentChunk) {
            this.state.currentChunk = currentChunk;
    
            try {
                // Preload the next chunk asynchronously
                this.road.addSegment(currentChunk + renderDistance - 1);
                console.log(`Chunk ${currentChunk + renderDistance - 1} preloaded`);

                // Add one random NPC to a random lane in the new chunk
                const RandomNPC = this.npcTypes[Math.floor(Math.random() * this.npcTypes.length)];
                const randomLane = Math.floor(Math.random() * 3) + 1; // Random lane (1, 2, or 3)
                const npc = new RandomNPC(randomLane, currentChunk + renderDistance);

                // Add the NPC to the state and the scene
                this.state.npcs.push(npc);
                this.add(npc);

                for (let i = 0; i < 2; i++){
                    // Add one random NPC to a random lane in the new chunk
                    const RandomOpposingNPC = this.npcTypes[Math.floor(Math.random() * this.npcTypes.length)];
                    const randomOpposingLane = Math.floor(Math.random() * 3) + 1; // Random lane (1, 2, or 3)
                    const opposing_npc = new RandomOpposingNPC(randomOpposingLane, currentChunk + renderDistance);

                    opposing_npc.rotation.y += Math.PI;
                    opposing_npc.position.x *= -1;

                    // Add the NPC to the state and the scene
                    this.state.opposing_npcs.push(opposing_npc);
                    this.add(opposing_npc);
                }
    
                // Remove the oldest chunk after the new one is loaded
                this.road.removeOldSegment();
                this.removeOldNPCs(currentChunk - 1);
            } catch (error) {
                console.error("Failed to preload chunk:", error);
            }
        }
    }

    removeOldNPCs(chunk) {
        // Iterate over all NPCs
        for (let i = this.state.npcs.length - 1; i >= 0; i--) {
            const npc = this.state.npcs[i];

            console.log("CURRENT CHUNK");
            console.log(npc.getCurrentChunk());
    
            // Check the NPC's current chunk
            if (-1 * npc.getCurrentChunk() <= chunk) {
                // Remove the NPC
                npc.remove();
                
                // Remove the NPC from the state
                this.state.npcs.splice(i, 1);
            }
        }

        for (let i = this.state.opposing_npcs.length - 1; i >= 0; i--) {
            const npc = this.state.opposing_npcs[i];

            console.log("CURRENT CHUNK");
            console.log(npc.getCurrentChunk());
    
            // Check the NPC's current chunk
            if (-1 * npc.getCurrentChunk() <= chunk) {
                // Remove the NPC
                npc.remove();
                
                // Remove the NPC from the state
                this.state.opposing_npcs.splice(i, 1);
            }
        }
    }

    updateNpcBoundingBoxes() {
        this.state.npcs.forEach((npc) => npc.updateBoundingBox());
    }

    checkCollisions() {
        const playerBox = this.player.getBoundingBox();

        this.state.npcs.forEach((npc) => {
            const npcBox = npc.getBoundingBox();
            if (playerBox.intersectsBox(npcBox)) {
                this.handleNpcCollision(npc);
            } else {
                npc.z_speed = npc.restingZSpeed;
            }
        });
    }

    handleNpcCollision(npc) {
        console.log(`Collision with ${npc.name}!`);
    
        const playerMass = 1; // Assign mass to the player
        const npcMass = npc.mass || 1; // Default mass if not defined
        const totalMass = playerMass + npcMass;
    
        // Player and NPC velocities
        const playerVelocity = { x: this.state.x_speed, z: this.state.z_speed };
        const npcVelocity = { x: npc.x_speed, z: npc.z_speed };
    
        // Elastic collision formulas
        const newPlayerZVelocity = (
            (playerMass - npcMass) * playerVelocity.z +
            2 * npcMass * npcVelocity.z
        ) / totalMass;
        const newNpcZVelocity = (
            (npcMass - playerMass) * npcVelocity.z +
            2 * playerMass * playerVelocity.z
        ) / totalMass;
    
        const newPlayerXVelocity = (
            (playerMass - npcMass) * playerVelocity.x +
            2 * npcMass * npcVelocity.x
        ) / totalMass;
        const newNpcXVelocity = (
            (npcMass - playerMass) * npcVelocity.x +
            2 * playerMass * playerVelocity.x
        ) / totalMass;
    
        // Apply updated velocities
        this.state.z_speed = newPlayerZVelocity;
        this.state.x_speed = newPlayerXVelocity;
        npc.z_speed = newNpcZVelocity;
        npc.x_speed = newNpcXVelocity;
    
        // Calculate collision direction and apply offset
        const collisionOffset = 0.1; // Adjust based on scale
        const collisionVector = {
            x: npc.position.x - this.player.position.x,
            z: npc.position.z - this.player.position.z,
        };
    
        // Normalize the collision vector
        const magnitude = Math.sqrt(collisionVector.x ** 2 + collisionVector.z ** 2);
        if (magnitude > 0) {
            collisionVector.x /= magnitude;
            collisionVector.z /= magnitude;
        }
    
        // Apply offset based on collision direction
        npc.updateBoundingBox();
        npc.position.x += collisionVector.x * collisionOffset;
        npc.updateBoundingBox();
        npc.position.z += collisionVector.z * collisionOffset;
    
        this.player.updateBoundingBox();
        this.player.position.x -= collisionVector.x * collisionOffset;
        this.position.x += collisionVector.x * collisionOffset;
        // this.player.updateBoundingBox();
        this.player.position.z -= collisionVector.z * collisionOffset;
        this.position.z += collisionVector.z * collisionOffset;
    
        // Damage the player based on collision force
        const impactForce = Math.abs(playerVelocity.z - npcVelocity.z) * playerMass;
        this.updateHealth(this.state.health - impactForce * 100); // Scale damage as needed
    }
    
    createHealthBar() {
        // Create the container for the health bar
        const healthBarContainer = document.createElement('div');
        healthBarContainer.id = 'health-bar-container';
        healthBarContainer.style.position = 'fixed';
        healthBarContainer.style.top = '10px';
        healthBarContainer.style.left = '50%';
        healthBarContainer.style.transform = 'translateX(-50%)';
        healthBarContainer.style.width = '80%';
        healthBarContainer.style.height = '20px';
        healthBarContainer.style.backgroundColor = '#555';
        healthBarContainer.style.border = '2px solid #000';
        healthBarContainer.style.borderRadius = '10px';
        healthBarContainer.style.overflow = 'hidden';
        healthBarContainer.style.zIndex = '1000';

        // Create the health bar itself
        const healthBar = document.createElement('div');
        healthBar.id = 'health-bar';
        healthBar.style.width = '100%';
        healthBar.style.height = '100%';
        healthBar.style.backgroundColor = '#f00';
        healthBar.style.borderRadius = '10px 0 0 10px';
        healthBar.style.transition = 'width 0.25s ease';

        // Append the health bar to the container
        healthBarContainer.appendChild(healthBar);

        // Append the container to the document body
        document.body.appendChild(healthBarContainer);

        // Store a reference to the health bar for updates
        this.healthBar = healthBar;
    }

    updateHealth(health) {
        // Update health in the state
        this.state.health = Math.max(0, Math.min(100, health)); // Clamp between 0 and 100

        // Update the width of the health bar
        if (this.healthBar) {
            this.healthBar.style.width = `${this.state.health}%`;
        }
    }

    addKeyboardControls() {
        // Keep track of keys being pressed
        const keysPressed = new Set();

        // Add event listeners
        window.addEventListener('keydown', (event) => {
            keysPressed.add(event.key.toLowerCase());
        });

        window.addEventListener('keyup', (event) => {
            keysPressed.delete(event.key.toLowerCase());
        });

        // Update speed based on pressed keys in the update loop
        this.state.updateSpeed = () => {
            if (keysPressed.has('w')) {
                this.state.z_speed = Math.min(this.state.z_speed + this.state.acceleration, this.state.maxSpeed);
            }
            if (keysPressed.has('s')) {
                if (this.state.z_speed > 0) {
                    this.state.z_speed = Math.max(this.state.z_speed - 5 * this.state.acceleration, -this.state.maxSpeed);
                } else {
                    this.state.z_speed = Math.max(this.state.z_speed - 0.5 * this.state.acceleration, -this.state.maxSpeed);
                }
            }
            if (keysPressed.has('d')) {
                this.player.rotation.y = -0.05
                this.state.x_speed = Math.max(this.state.x_speed - this.state.acceleration, -this.state.maxSpeed);
            }
            if (keysPressed.has('a')) {
                this.player.rotation.y = 0.05
                this.state.x_speed = Math.min(this.state.x_speed + this.state.acceleration, this.state.maxSpeed);
            }

            // Gradual deceleration (friction effect) when no keys are pressed
            if (!keysPressed.has('w') && !keysPressed.has('s')) {
                this.state.z_speed *= 0.99; // Friction for z_speed
            }
            if (!keysPressed.has('a') && !keysPressed.has('d')) {
                this.player.rotation.y = 0
                this.state.x_speed *= 0.90; // Friction for x_speed
            }
        };
    }

    update(timeStamp) {
        const { updateList, x_speed, z_speed, updateSpeed } = this.state;

        // Update speeds based on keyboard input
        updateSpeed();

        // Update player bounding box
        this.player.updateBoundingBox();
        this.updateNpcBoundingBoxes();

        if (this.player.position.x >= 4.2955){
            this.updateHealth(this.state.health - 5 * Math.abs(this.state.z_speed) - 5 * Math.abs(this.state.x_speed));
            this.state.x_speed = 0.01;
            this.state.z_speed /= 1.3;
        }

        if (this.player.position.x <= 0.9864){
            this.updateHealth(this.state.health - 5 * Math.abs(this.state.z_speed) - 5 * Math.abs(this.state.x_speed));
            this.state.x_speed = -0.01;
            this.state.z_speed /= 1.3;
        }


        // Update position based on speed
        this.position.x += x_speed;
        this.position.z += z_speed;
        this.player.position.x -= x_speed;
        this.player.position.z -= z_speed;

        // Update player bounding box
        // this.player.updateBoundingBox();

        // Update NPC car positions
        this.state.npcs.forEach((npc) => {
            npc.updateBoundingBox();
            if (npc.position.x >= 4.3955){
                npc.x_speed = 0.01;
            }
            if (npc.position.x <= 0.8864){
                npc.x_speed = -0.01;
            }
            npc.position.z -= npc.z_speed;
            npc.position.x -= npc.x_speed;
            npc.x_speed *= 0.9;
        });

        this.state.opposing_npcs.forEach((npc) => {
            npc.position.z += npc.restingZSpeed;
            npc.position.x -= npc.x_speed;
        });

        // Check collisions
        this.checkCollisions();

        // Call updateRoad() asynchronously without blocking
        this.updateRoad();

        // Call update for each object in the updateList
        for (const obj of updateList) {
            obj.update(timeStamp);
        }
    }
}

export default SeedScene;
