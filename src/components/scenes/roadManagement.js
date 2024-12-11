export async function initRoad(scene) {
    // Load the model template once
    await scene.road.loadModelTemplate();

    // Add initial road chunks
    for (let chunk = 0; chunk < scene.state.renderDistance; chunk++) {
        // Add road segment for the chunk
        await scene.road.addSegment(chunk);

        // For each lane in the chunk, add a random NPC
        for (let lane = 0; lane < 3; lane++) { // Assuming 3 lanes
            // Pick a random NPC type
            const RandomNPC = scene.npcTypes[Math.floor(Math.random() * scene.npcTypes.length)];

            // Create the NPC instance
            const npc = new RandomNPC(lane + 1, chunk + 1);

            // Add the NPC to the state and the scene
            scene.state.npcs.push(npc);
            scene.add(npc);
        }
        for (let lane = 0; lane < 3; lane++) { // Assuming 3 lanes
            // Pick a random NPC type
            const RandomNPC = scene.npcTypes[Math.floor(Math.random() * scene.npcTypes.length)];

            // Create the NPC instance
            const npc = new RandomNPC(lane + 1, chunk + 1);
            npc.rotation.y += Math.PI;
            npc.position.x *= -1;

            // Add the NPC to the state and the scene
            scene.state.opposing_npcs.push(npc);
            scene.add(npc);
        }
    }
}

export async function updateRoad(scene) {
    const { renderDistance } = scene.state;

    // Calculate the current chunk based on the player's position
    const currentChunk = Math.floor(scene.position.z / scene.road.chunkLength) - 1;

    // If the player has advanced to a new chunk
    if (currentChunk > scene.state.currentChunk) {
        scene.state.currentChunk = currentChunk;

        try {
            // Preload the next chunk asynchronously
            scene.road.addSegment(currentChunk + renderDistance - 1);
            console.log(`Chunk ${currentChunk + renderDistance - 1} preloaded`);

            let cap;
            if (scene.player.position.z >= -30 * scene.state.positionToMiles){
                console.log("RUNNING THE IF");
                cap = 1;
            } else{
                console.log("RUNNING THE ELSE");
                cap = 2;
            }
            for (let i = 0; i < cap; i++){
                // Add one random NPC to a random lane in the new chunk
                const RandomNPC = scene.npcTypes[Math.floor(Math.random() * scene.npcTypes.length)];
                const randomLane = Math.floor(Math.random() * 3) + 1; // Random lane (1, 2, or 3)
                const npc = new RandomNPC(randomLane, currentChunk + renderDistance);

                // Add the NPC to the state and the scene
                scene.state.npcs.push(npc);
                scene.add(npc);
            }
            
            for (let i = 0; i < 2; i++){
                // Add one random NPC to a random lane in the new chunk
                const RandomOpposingNPC = scene.npcTypes[Math.floor(Math.random() * scene.npcTypes.length)];
                const randomOpposingLane = Math.floor(Math.random() * 3) + 1; // Random lane (1, 2, or 3)
                const opposing_npc = new RandomOpposingNPC(randomOpposingLane, currentChunk + renderDistance);

                opposing_npc.rotation.y += Math.PI;
                opposing_npc.position.x *= -1;

                // Add the NPC to the state and the scene
                scene.state.opposing_npcs.push(opposing_npc);
                scene.add(opposing_npc);
            }

            // Remove the oldest chunk after the new one is loaded
            scene.road.removeOldSegment();
            scene.removeOldNPCs(currentChunk - 1);
        } catch (error) {
            console.error("Failed to preload chunk:", error);
        }
    }
}