export function createStatusDisplay(scene) {
    // Create a container for the timer and distance
    const statusContainer = document.createElement('div');
    statusContainer.id = 'status-container';
    statusContainer.style.position = 'absolute';
    statusContainer.style.top = '35px';
    statusContainer.style.left = '15px';
    statusContainer.style.color = '#fff';
    statusContainer.style.fontFamily = 'Arial, sans-serif';
    statusContainer.style.fontSize = '25px';
    statusContainer.style.zIndex = '1000';

    // Timer display
    scene.timerElement = document.createElement('div');
    scene.timerElement.id = 'timer';
    scene.timerElement.innerHTML = 'Time: 0.00s';
    statusContainer.appendChild(scene.timerElement);

    // Distance display
    scene.distanceElement = document.createElement('div');
    scene.distanceElement.id = 'distance';
    scene.distanceElement.innerHTML = 'Distance: 0.00 miles';
    statusContainer.appendChild(scene.distanceElement);

    // Append the status container to the document body
    document.body.appendChild(statusContainer);
}
