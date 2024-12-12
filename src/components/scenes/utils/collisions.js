import { updateHealth } from './healthBar';


export function checkCollisions(scene) {
    const playerBox = scene.player.getBoundingBox();

    scene.state.npcs.forEach((npc) => {
        const npcBox = npc.getBoundingBox();
        if (playerBox.intersectsBox(npcBox)) {
            handleNpcCollision(scene, npc);
        } else {
            npc.z_speed = npc.restingZSpeed;
        }
    });
}

export function handleNpcCollision(scene, npc) {
    console.log(`Collision with ${npc.name}!`);

    const playerMass = 1; // Assign mass to the player
    const npcMass = npc.mass || 1; // Default mass if not defined
    const totalMass = playerMass + npcMass;

    // Player and NPC velocities
    const playerVelocity = { x: scene.state.x_speed, z: scene.state.z_speed };
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
    scene.state.z_speed = newPlayerZVelocity;
    scene.state.x_speed = newPlayerXVelocity;
    npc.z_speed = newNpcZVelocity;
    npc.x_speed = newNpcXVelocity;

    // Calculate collision direction and apply offset
    const collisionOffset = 0.1; // Adjust based on scale
    const collisionVector = {
        x: npc.position.x - scene.player.position.x,
        z: npc.position.z - scene.player.position.z,
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

    scene.player.updateBoundingBox();
    scene.player.position.x -= collisionVector.x * collisionOffset;
    scene.position.x += collisionVector.x * collisionOffset;
    // scene.player.updateBoundingBox();
    scene.player.position.z -= collisionVector.z * collisionOffset;
    scene.position.z += collisionVector.z * collisionOffset;

    // Damage the player based on collision force
    const impactForce = Math.abs(playerVelocity.z - npcVelocity.z) * playerMass;
    updateHealth(scene, scene.state.health - impactForce * 100); // Scale damage as needed
}