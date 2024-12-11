export function addKeyboardControls(scene) {
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
    scene.state.updateSpeed = () => {
        if (keysPressed.has('w')) {
            scene.state.z_speed = Math.min(scene.state.z_speed + scene.state.acceleration, scene.state.maxSpeed);
        }
        if (keysPressed.has('s')) {
            if (scene.state.z_speed > 0) {
                scene.state.z_speed = Math.max(scene.state.z_speed - 5 * scene.state.acceleration, -scene.state.maxSpeed);
            } else {
                scene.state.z_speed = Math.max(scene.state.z_speed - 0.5 * scene.state.acceleration, -scene.state.maxSpeed);
            }
        }
        if (keysPressed.has('d')) {
            scene.player.rotation.y = -0.05
            scene.state.x_speed = Math.max(scene.state.x_speed - scene.state.acceleration, -scene.state.maxSpeed);
        }
        if (keysPressed.has('a')) {
            scene.player.rotation.y = 0.05
            scene.state.x_speed = Math.min(scene.state.x_speed + scene.state.acceleration, scene.state.maxSpeed);
        }

        // Gradual deceleration (friction effect) when no keys are pressed
        if (!keysPressed.has('w') && !keysPressed.has('s')) {
            scene.state.z_speed *= 0.99; // Friction for z_speed
        }
        if (!keysPressed.has('a') && !keysPressed.has('d')) {
            scene.player.rotation.y = 0
            scene.state.x_speed *= 0.90; // Friction for x_speed
        }
    };
}