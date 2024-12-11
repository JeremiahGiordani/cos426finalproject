export function createHealthBar(scene) {
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
    scene.healthBar = healthBar;

    // Create the popup for "Jail!"
    const popup = document.createElement('div');
    popup.id = 'jail-popup';
    popup.style.position = 'absolute';
    popup.style.top = '50%';
    popup.style.left = '50%';
    popup.style.transform = 'translate(-50%, -50%)';
    popup.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    popup.style.color = '#fff';
    popup.style.padding = '20px';
    popup.style.borderRadius = '10px';
    popup.style.textAlign = 'center';
    popup.style.display = 'none'; // Initially hidden

    document.body.appendChild(popup);
}

export function updateHealth(scene, health) {
    // Update health in the state
    scene.state.health = Math.max(0, Math.min(100, health)); // Clamp between 0 and 100

    // Update the width of the health bar
    if (scene.healthBar) {
        scene.healthBar.style.width = `${scene.state.health}%`;
    }
}

export function showJailPopup() {
    const popup = document.getElementById('jail-popup');
    if (!popup) return;

    // List of potential crimes
    const crimes = [
        'Vehicular manslaughter',
        'Driving under the influence',
        'Fleeing the scene of an accident',
        'Reckless endangerment',
        'Hit and run',
        'Property damage over $10,000',
    ];

    // Generate the popup content
    popup.innerHTML = `
        <h1>Jail! Straight to Jail!</h1>
        <p>The Pennsylvania State Troopers have arrested you.</p>
        <p>They've charged you with:</p>
        <ul>
            ${crimes.map((crime) => `<li>${crime}</li>`).join('')}
        </ul>
        <p>Better luck next time, reckless driver!</p>
        <button id="restart-button" style="
            margin-top: 20px; 
            padding: 10px 20px; 
            background-color: #ff5555; 
            color: white; 
            border: none; 
            border-radius: 5px; 
            cursor: pointer;
            font-size: 16px;">
            Start Over
        </button>
    `;

    // Display the popup
    popup.style.display = 'block';

    // Add event listener to restart button
    document.getElementById('restart-button').addEventListener('click', () => {
        window.location.reload(); // Reload the page directly here
    });
    
}

export function showCongratsPopup(elapsedTime) {
    const popup = document.createElement('div');
    popup.id = 'congrats-popup';
    popup.style.position = 'absolute';
    popup.style.top = '50%';
    popup.style.left = '50%';
    popup.style.transform = 'translate(-50%, -50%)';
    popup.style.backgroundColor = 'rgba(0, 255, 0, 0.9)';
    popup.style.color = '#fff';
    popup.style.padding = '20px';
    popup.style.borderRadius = '10px';
    popup.style.textAlign = 'center';
    popup.style.fontSize = '18px';
    popup.style.zIndex = '1000';

    // Generate the popup content
    popup.innerHTML = `
        <h1>Congratulations!</h1>
        <p>You made it to the finish line! Great job navigating the roads!</p>
        <p>You completed the course in ${elapsedTime.toFixed(2)} seconds!</p>
        <button id="restart-button" style="
            margin-top: 20px; 
            padding: 10px 20px; 
            background-color: #5555ff; 
            color: white; 
            border: none; 
            border-radius: 5px; 
            cursor: pointer;
            font-size: 16px;">
            Start Over
        </button>
    `;

    // Add event listener to restart button
    popup.querySelector('#restart-button').addEventListener('click', () => {
        window.location.reload(); // Restart the game
    });

    // Append popup to the document body
    document.body.appendChild(popup);
}

