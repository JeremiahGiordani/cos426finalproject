import * as Dat from 'dat.gui';
import { Scene, Color } from 'three';
import { Flower, Land, Road, Player } from 'objects';
import { BasicLights } from 'lights';

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
            acceleration: 0.001, // Acceleration when keys are pressed
            maxSpeed: 0.5, // Maximum speed limit
            health: 100,
            currentChunk: 0, // Chunk the player is currently on
            renderDistance: 5, // Number of chunks to render ahead
        };

        // Set background to a nice color
        this.background = new Color(0x7ec0ee);

        // Add meshes to scene
        // const land = new Land();
        // const flower = new Flower(this);
        this.road = new Road();
        const lights = new BasicLights();
        this.player = new Player();
        this.add(this.road, lights, this.player);

        // Add keyboard event listeners
        this.addKeyboardControls();

        // Dynamically create the health bar
        this.createHealthBar();

        // Initialize road
        this.initRoad();

        this.position.x = -2.5
        this.player.position.x = 2.5
    }

    addToUpdateList(object) {
        this.state.updateList.push(object);
    }

    initRoad() {
        // Add initial road chunks
        for (let i = 0; i < this.state.renderDistance; i++) {
            this.road.addSegment(i);
        }
    }

    updateRoad() {
        const { renderDistance } = this.state;
        const currentChunk = Math.floor(this.position.z / this.road.chunkLength) - 1;
        console.log(currentChunk);

        // If the player has advanced to a new chunk
        if (currentChunk > this.state.currentChunk) {
            this.state.currentChunk = currentChunk;

            // Add the next chunk
            this.road.addSegment(currentChunk + renderDistance - 1);

            // Remove the oldest chunk
            this.road.removeOldSegment();
        }
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
                if (this.player.position.x >= 4.2955){
                    this.updateHealth(this.state.health - 10 * Math.abs(this.state.z_speed) - 10 * Math.abs(this.state.x_speed));
                    this.state.x_speed = 0;
                    this.state.z_speed /= 2;
                } else {
                    this.state.x_speed = Math.max(this.state.x_speed - this.state.acceleration, -this.state.maxSpeed);
                }
            }
            if (keysPressed.has('a')) {
                this.state.x_speed = Math.min(this.state.x_speed + this.state.acceleration, this.state.maxSpeed);
            }

            // Gradual deceleration (friction effect) when no keys are pressed
            if (!keysPressed.has('w') && !keysPressed.has('s')) {
                this.state.z_speed *= 0.98; // Friction for z_speed
            }
            if (!keysPressed.has('a') && !keysPressed.has('d')) {
                this.state.x_speed *= 0.90; // Friction for x_speed
            }
        };
    }

    update(timeStamp) {
        const { updateList, x_speed, z_speed, updateSpeed } = this.state;

        // Update speeds based on keyboard input
        updateSpeed();

        // Update position based on speed
        this.position.x += x_speed;
        this.position.z += z_speed;
        this.player.position.x -= x_speed;
        this.player.position.z -= z_speed;

        this.updateRoad();

        // Call update for each object in the updateList
        for (const obj of updateList) {
            obj.update(timeStamp);
        }
    }
}

export default SeedScene;
