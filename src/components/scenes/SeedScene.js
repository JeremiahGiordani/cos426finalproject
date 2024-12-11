import { Scene, Color } from 'three';
import { Road, Player } from 'objects';
import { Turnpike, Checkpoint0, Checkpoint1, Checkpoint2, Checkpoint3, Checkpoint4, Checkpoint5, Checkpoint6, Checkpoint7, Checkpoint8 } from 'objects';
import { BasicLights } from 'lights';
import { Old_Car_NPC, Car_2_NPC, Cop_NPC, Fire_Truck_NPC, Taxi_NPC, Bus_NPC, Truck_NPC, Ambulance_NPC, Car_NPC } from '../objects';
import { addKeyboardControls } from './controls'; 
import { createHealthBar, updateHealth, showJailPopup, showCongratsPopup } from './healthBar';
import { initRoad, updateRoad } from './roadManagement';
import { checkCollisions } from './collisions';
import { createStatusDisplay } from './statusDisplay';


class SeedScene extends Scene {
    constructor() {
        // Call parent Scene() constructor
        super();

        // Timer and distance state
        this.startTime = Date.now();
        this.timerElement = null;
        this.distanceElement = null;

        // Add the timer and distance display
        createStatusDisplay(this);

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
            positionToMiles: 50,
            npcs: [],
            opposing_npcs: [],
            passedCheckpoints: new Set(), // Track passed checkpoints
        };

        this.jail = false;
        this.completed = false;

        // Set background to a nice color
        this.background = new Color(0x7ec0ee);

        // Add meshes to scene
        const lights = new BasicLights();
        this.road = new Road();
        const sign = new Turnpike();
        this.player = new Player();
        
        // Initialize checkpoints
        this.checkpoints = [
            new Checkpoint0(this.state.positionToMiles, 2),
            new Checkpoint1(this.state.positionToMiles, 7),
            new Checkpoint2(this.state.positionToMiles, 12),
            new Checkpoint3(this.state.positionToMiles, 17),
            new Checkpoint4(this.state.positionToMiles, 27),
            new Checkpoint5(this.state.positionToMiles, 37),
            new Checkpoint6(this.state.positionToMiles, 47),
            new Checkpoint7(this.state.positionToMiles, 62),
            new Checkpoint8(this.state.positionToMiles, 77),
        ];
        // Add NPC car and track it
        this.add(this.road, lights, sign, this.player, ...this.checkpoints);

        // Add keyboard event listeners
        addKeyboardControls(this);

        // Dynamically create the health bar
        createHealthBar(this);

        // Initialize road
        initRoad(this);

        this.position.x = -2.5
        this.player.position.x = 2.5
        this.npcTypes = [
            Old_Car_NPC, 
            Car_2_NPC, 
            Cop_NPC, 
            Fire_Truck_NPC, 
            Taxi_NPC, 
            Bus_NPC, 
            Truck_NPC, 
            Ambulance_NPC, 
            Car_NPC
        ];
    }

    addToUpdateList(object) {
        this.state.updateList.push(object);
    }

    removeOldNPCs(chunk) {
        // Iterate over all NPCs
        for (let i = this.state.npcs.length - 1; i >= 0; i--) {
            const npc = this.state.npcs[i];
    
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
    
            // Check the NPC's current chunk
            if (-1 * npc.getCurrentChunk() <= chunk) {
                // Remove the NPC
                npc.remove();
                
                // Remove the NPC from the state
                this.state.opposing_npcs.splice(i, 1);
            }
        }
    }

    checkForCheckpoint() {
        const playerZ = this.player.position.z;
    
        for (const checkpoint of this.checkpoints) {
            const checkpointZ = checkpoint.position.z;
    
            // Check if the player has passed this checkpoint
            if (!this.state.passedCheckpoints.has(checkpoint) && playerZ <= checkpointZ) {
                console.log(`Player passed ${checkpoint.name}`);
                updateHealth(this, 100); // Restore health
                this.state.passedCheckpoints.add(checkpoint); // Mark as passed
            }
        }
    }
    

    updateNpcBoundingBoxes() {
        this.state.npcs.forEach((npc) => npc.updateBoundingBox());
    }

    update(timeStamp) {
        const { updateList, x_speed, z_speed, updateSpeed } = this.state;

        if (this.jail || this.completed){
            return;
        }
        // Update speeds based on keyboard input
        updateSpeed();

        // Update player bounding box
        this.player.updateBoundingBox();
        this.updateNpcBoundingBoxes();

        // Update timer
        const elapsedTime = (Date.now() - this.startTime) / 1000; // Time in seconds
        this.timerElement.innerHTML = `Time: ${elapsedTime.toFixed(2)}s`;

        // Update distance
        const distance = Math.abs(this.player.position.z) / this.state.positionToMiles; // Convert to miles
        this.distanceElement.innerHTML = `Distance: ${distance.toFixed(2)} miles`;

        // Check if health is 0 or below
        if (this.state.health <= 0) {
            showJailPopup();
            this.jail = true;
            return; // Stop further updates
        }

        // Check if the player has reached the finish line
        if (this.player.position.z <= -77 * this.state.positionToMiles) {
            showCongratsPopup(elapsedTime);
            this.completed = true;
            return; // Stop further updates
        }

        if (this.player.position.x >= 4.2955){
            updateHealth(this, this.state.health - 5 * Math.abs(this.state.z_speed) - 5 * Math.abs(this.state.x_speed));
            this.state.x_speed = 0.01;
            this.state.z_speed /= 1.3;
        }

        if (this.player.position.x <= 0.9864){
            updateHealth(this, this.state.health - 5 * Math.abs(this.state.z_speed) - 5 * Math.abs(this.state.x_speed));
            this.state.x_speed = -0.01;
            this.state.z_speed /= 1.3;
        }


        // Update position based on speed
        this.position.x += x_speed;
        this.position.z += z_speed;
        this.player.position.x -= x_speed;
        this.player.position.z -= z_speed;

        // Check if the player passes a checkpoint
        this.checkForCheckpoint();

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
        checkCollisions(this);

        // Call updateRoad() asynchronously without blocking
        updateRoad(this);

        // Call update for each object in the updateList
        for (const obj of updateList) {
            obj.update(timeStamp);
        }
    }

    restartGame() {
        // Reload the page to reset the game
        window.location.reload();
    }    
}

export default SeedScene;
