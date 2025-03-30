// game.js
const egg = document.getElementById('egg');
const syllableBasket = document.getElementById('syllable-basket');
const nonSyllableBasket = document.getElementById('non-syllable-basket');
let selectedItem = null;

// Debug check for ghost tracker at start
console.log('=== INITIALIZATION START ===');

// Create a simple ghost tracker at the very start of the file
console.log('Creating new ghost tracker...');
const ghostTracker = document.createElement('div');
ghostTracker.style.cssText = `
    position: fixed;
    background-color: white;
    color: black;
    padding: 15px;
    border: 2px solid black;
    border-radius: 8px;
    pointer-events: none;
    z-index: 9999;
    font-size: 24px;
    font-family: Arial;
    cursor: pointer;
    display: none;
`;
document.body.appendChild(ghostTracker);
console.log('Ghost tracker appended to body');

// Test function to verify ghost tracker
function testGhostVisibility() {
    console.log('Testing ghost visibility...');
    ghostTracker.textContent = 'TEST GHOST';
    ghostTracker.style.left = '50%';
    ghostTracker.style.top = '50%';
    ghostTracker.style.display = 'block';
    
    // Log ghost tracker state
    console.log('Ghost tracker properties:', {
        'element': ghostTracker,
        'inDOM': document.body.contains(ghostTracker),
        'display': ghostTracker.style.display,
        'visibility': ghostTracker.style.visibility,
        'zIndex': ghostTracker.style.zIndex,
        'text': ghostTracker.textContent
    });
}

// Modified mousemove handler with debugging
document.addEventListener('mousemove', (event) => {
    if (selectedItem) {
        console.log('Moving ghost tracker:', {
            x: event.clientX,
            y: event.clientY,
            item: selectedItem
        });
        ghostTracker.style.left = `${event.clientX}px`;
        ghostTracker.style.top = `${event.clientY}px`;
    }
});

// Add audio element for egg cracking sound
const crackSound = document.createElement('audio');
crackSound.src = 'https://github.com/jjazut1/sound-hosting/raw/refs/heads/main/break.mp3';
crackSound.id = 'breakSound';
document.body.appendChild(crackSound);

// Create arrays of syllables and non-syllables
const allSyllables = ['ran', 'im', 're', 'yes', 'ape', 'he'];
const allNonSyllables = ['fl', 'ip', 'teb', 'yms', 'stre', 'gld', 'br'];

// Create copies that we'll remove items from as they're used
let remainingSyllables = [...allSyllables];
let remainingNonSyllables = [...allNonSyllables];

// Function to get a random item from an array
function getRandomItem(array) {
    const randomIndex = Math.floor(Math.random() * array.length);
    return array.splice(randomIndex, 1)[0]; // Remove and return the item
}

// Function to check if we need to reset either array
function resetArraysIfNeeded() {
    if (remainingSyllables.length === 0) {
        remainingSyllables = [...allSyllables];
    }
    if (remainingNonSyllables.length === 0) {
        remainingNonSyllables = [...allNonSyllables];
    }
}

// Function to generate random cracks
function generateCracks(element) {
    // Remove any existing cracks
    const existingCracks = element.querySelectorAll('.crack-line');
    existingCracks.forEach(crack => crack.remove());
    
    // Create SVG element for cracks
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'crack-line');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.style.position = 'absolute';
    svg.style.top = '0';
    svg.style.left = '0';
    svg.style.pointerEvents = 'none';
    
    // Create random cracks
    const numCracks = 2 + Math.floor(Math.random() * 3); // 2-4 cracks
    
    for (let i = 0; i < numCracks; i++) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        
        // Random starting point near the center
        const startX = 40 + Math.random() * 20; // 40-60%
        const startY = 30 + Math.random() * 40; // 30-70%
        
        // Generate random path with multiple segments
        let d = `M ${startX} ${startY}`;
        
        // Create 2-4 segments for each crack
        const segments = 2 + Math.floor(Math.random() * 3);
        for (let j = 0; j < segments; j++) {
            // Random direction and length
            const length = 10 + Math.random() * 20;
            const angle = Math.random() * 360;
            const rad = angle * Math.PI / 180;
            
            // Calculate endpoint
            const endX = startX + length * Math.cos(rad);
            const endY = startY + length * Math.sin(rad);
            
            // Add line segment
            d += ` L ${endX} ${endY}`;
        }
        
        path.setAttribute('d', d);
        path.setAttribute('stroke', 'rgba(70, 40, 0, 0.7)');
        path.setAttribute('stroke-width', '1.5');
        path.setAttribute('fill', 'none');
        
        svg.appendChild(path);
    }
    
    // Add smaller branching cracks
    for (let i = 0; i < numCracks * 2; i++) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        
        // Random starting point
        const startX = 20 + Math.random() * 60; // 20-80%
        const startY = 20 + Math.random() * 60; // 20-80%
        
        // Simple zigzag path
        const length = 5 + Math.random() * 10;
        const angle = Math.random() * 360;
        const rad = angle * Math.PI / 180;
        
        const midX = startX + length/2 * Math.cos(rad + Math.PI/8);
        const midY = startY + length/2 * Math.sin(rad + Math.PI/8);
        const endX = startX + length * Math.cos(rad);
        const endY = startY + length * Math.sin(rad);
        
        const d = `M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`;
        
        path.setAttribute('d', d);
        path.setAttribute('stroke', 'rgba(70, 40, 0, 0.5)');
        path.setAttribute('stroke-width', '0.8');
        path.setAttribute('fill', 'none');
        
        svg.appendChild(path);
    }
    
    element.appendChild(svg);
}

// Modified egg click handler
function createEggs() {
    console.log('Creating eggs...');
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = '';

    for (let i = 0; i < 10; i++) {
        const egg = document.createElement('div');
        egg.className = 'egg';
        egg.textContent = '?';
        egg.dataset.cracked = 'false';
        gameBoard.appendChild(egg);

        egg.addEventListener('click', function(event) {
            console.log('Egg clicked:', {
                'cracked': this.dataset.cracked,
                'selectedItem': selectedItem,
                'ghostTrackerVisible': ghostTracker.style.display
            });
            
            if (this.dataset.cracked === 'false' && !selectedItem) {
                // Check if we need to reset arrays
                if (remainingSyllables.length === 0) {
                    remainingSyllables = [...allSyllables];
                }
                if (remainingNonSyllables.length === 0) {
                    remainingNonSyllables = [...allNonSyllables];
                }

                const isSyllable = Math.random() < 0.5;
                const item = isSyllable 
                    ? getRandomItem(remainingSyllables) 
                    : getRandomItem(remainingNonSyllables);

                // Generate cracks
                generateCracks(this);

                // Play cracking sound
                crackSound.currentTime = 0;
                crackSound.play();
                setTimeout(() => {
                    crackSound.pause();
                    crackSound.currentTime = 0;
                }, crackSound.duration * 500 || 500);

                // Flash effect and reveal
                const originalColor = this.style.backgroundColor;
                this.style.backgroundColor = '#fff9e6';
                setTimeout(() => {
                    this.style.backgroundColor = originalColor;
                    this.classList.add('cracking');

                    setTimeout(() => {
                        this.textContent = item;
                        this.classList.remove('cracking');
                        this.classList.add('cracked');
                        this.dataset.cracked = 'true';
                        selectedItem = item;
                        
                        // Update ghost tracker at click position
                        ghostTracker.textContent = item;
                        ghostTracker.style.display = 'block';
                        ghostTracker.style.left = `${event.clientX}px`;
                        ghostTracker.style.top = `${event.clientY}px`;
                        
                        // Add dragging class to body to maintain pointer cursor
                        document.body.classList.add('dragging');
                    }, 500);
                }, 50);
            } else if (this.dataset.cracked === 'true' && !selectedItem) {
                selectedItem = this.textContent;
                ghostTracker.textContent = selectedItem;
                ghostTracker.style.display = 'block';
                ghostTracker.style.left = `${event.clientX}px`;
                ghostTracker.style.top = `${event.clientY}px`;
                document.body.classList.add('dragging');
            }
        });
    }
}

// Run test when page loads
window.addEventListener('DOMContentLoaded', () => {
    console.log('=== PAGE LOADED ===');
    addClouds();
    
    // Create quadrants
    const container = document.createElement('div');
    container.id = 'game-container';
    
    const leftQuadrant = document.createElement('div');
    leftQuadrant.className = 'left-quadrant';
    
    const rightQuadrant = document.createElement('div');
    rightQuadrant.className = 'right-quadrant';
    
    // Move existing game elements to left quadrant
    const gameBoard = document.getElementById('game-board');
    const baskets = document.getElementById('baskets');
    
    if (gameBoard) leftQuadrant.appendChild(gameBoard);
    if (baskets) leftQuadrant.appendChild(baskets);
    
    // Add quadrants to container
    container.appendChild(leftQuadrant);
    container.appendChild(rightQuadrant);
    
    // Replace existing content with new structure
    document.body.innerHTML = '';
    document.body.appendChild(container);
    
    // Re-add clouds
    addClouds();
    createEggs();
    testGhostVisibility(); // This will test if the ghost tracker can be shown
    console.log('Game initialization complete');
});

// Update basket click handler to properly hide ghost tracker
[syllableBasket, nonSyllableBasket].forEach(basket => {
    basket.addEventListener('click', function() {
        console.log('Basket clicked, selectedItem:', selectedItem);
        if (selectedItem) {
            const isSyllable = allSyllables.includes(selectedItem);
            if ((isSyllable && this.id === 'syllable-basket') || (!isSyllable && this.id === 'non-syllable-basket')) {
                const currentItems = this.getAttribute('data-items') || '';
                const updatedItems = currentItems ? `${currentItems}, ${selectedItem}` : selectedItem;
                this.setAttribute('data-items', updatedItems);
                this.querySelector('.items').textContent = updatedItems;

                // Reset selection and cursor
                selectedItem = null;
                ghostTracker.style.display = 'none';
                document.body.classList.remove('dragging');
            }
        }
    });
});

// Add this to ensure the audio is loaded before trying to use its duration
crackSound.addEventListener('loadedmetadata', () => {
    console.log('Audio duration:', crackSound.duration);
});

// Add clouds to the background
function addClouds() {
    for (let i = 0; i < 3; i++) {
        const cloud = document.createElement('div');
        cloud.className = 'cloud';
        document.body.appendChild(cloud);
    }
}

// Add CSS for dragging state
const style = document.createElement('style');
style.textContent = `
    .dragging {
        cursor: pointer !important;
    }
    .dragging * {
        cursor: pointer !important;
    }
`;
document.head.appendChild(style);

console.log('=== INITIALIZATION COMPLETE ===');