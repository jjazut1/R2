// game.js
const egg = document.getElementById('egg');
const syllableBasket = document.getElementById('syllable-basket');
const nonSyllableBasket = document.getElementById('non-syllable-basket');
let selectedItem = null;
let isDragging = false;

// Debug check for ghost tracker at start
console.log('=== INITIALIZATION START ===');

// First, let's create a very simple test
const testDiv = document.createElement('div');
testDiv.innerHTML = 'TEST DIV';
testDiv.style.cssText = `
    position: fixed;
    left: 50%;
    top: 50%;
    background: red;
    color: white;
    padding: 20px;
    z-index: 99999;
    font-size: 30px;
`;
document.body.appendChild(testDiv);

// Log that we created it
console.log('Test div created:', testDiv);
console.log('Test div in DOM:', document.body.contains(testDiv));

// Now let's create the actual ghost tracker with minimal properties
const ghostTracker = document.createElement('div');
ghostTracker.style.cssText = `
    position: fixed;
    background: white;
    border: 2px solid black;
    padding: 10px;
    z-index: 99999;
    pointer-events: none;
`;
document.body.appendChild(ghostTracker);

// Simplified mouse tracking
let selectedItem = null;

function updateGhostTracker(x, y, text) {
    ghostTracker.style.left = x + 'px';
    ghostTracker.style.top = y + 'px';
    ghostTracker.textContent = text;
    ghostTracker.style.display = 'block';
    console.log('Updated ghost:', {x, y, text});
}

// Simplified egg click handler
function createEggs() {
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = '';

    for (let i = 0; i < 10; i++) {
        const egg = document.createElement('div');
        egg.className = 'egg';
        egg.textContent = '?';
        egg.dataset.cracked = 'false';
        gameBoard.appendChild(egg);

        egg.addEventListener('click', function(event) {
            if (this.dataset.cracked === 'false' && !selectedItem) {
                const isSyllable = Math.random() < 0.5;
                const items = isSyllable ? ['ran', 'im', 're', 'yes', 'ape', 'he'] : ['fl', 'ip', 'teb', 'yms', 'stre', 'gld', 'br'];
                const item = items[Math.floor(Math.random() * items.length)];
                
                this.textContent = item;
                this.classList.add('cracked');
                this.dataset.cracked = 'true';
                selectedItem = item;
                
                updateGhostTracker(event.clientX, event.clientY, item);
            } else if (this.dataset.cracked === 'true' && !selectedItem) {
                selectedItem = this.textContent;
                updateGhostTracker(event.clientX, event.clientY, this.textContent);
            }
        });
    }
}

// Simplified mouse move
document.addEventListener('mousemove', (event) => {
    if (selectedItem) {
        updateGhostTracker(event.clientX, event.clientY, selectedItem);
    }
});

// Simplified basket handling
[syllableBasket, nonSyllableBasket].forEach(basket => {
    basket.addEventListener('click', function() {
        if (selectedItem) {
            const isSyllable = ['ran', 'im', 're', 'yes', 'ape', 'he'].includes(selectedItem);
            if ((isSyllable && this.id === 'syllable-basket') || (!isSyllable && this.id === 'non-syllable-basket')) {
                const currentItems = this.getAttribute('data-items') || '';
                const updatedItems = currentItems ? `${currentItems}, ${selectedItem}` : selectedItem;
                this.setAttribute('data-items', updatedItems);
                this.querySelector('.items').textContent = updatedItems;

                selectedItem = null;
                ghostTracker.style.display = 'none';
            }
        }
    });
});

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    createEggs();
    console.log('Game initialized');
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
    console.log('Game initialization complete');
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

    #game-container {
        position: relative;
        z-index: 1;
        display: grid;
        grid-template-columns: 1fr 1fr;
        min-height: 100vh;
        gap: 20px;
        pointer-events: none; /* Allow events to pass through container */
    }

    .left-quadrant, .right-quadrant {
        pointer-events: auto; /* Re-enable events for quadrant content */
        position: relative;
    }

    .virtual-drag-preview {
        position: fixed !important;
        z-index: 10000 !important;
    }
`;
document.head.appendChild(style);

console.log('=== INITIALIZATION COMPLETE ===');