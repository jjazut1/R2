// game.js
const egg = document.getElementById('egg');
const syllableBasket = document.getElementById('syllable-basket');
const nonSyllableBasket = document.getElementById('non-syllable-basket');
let selectedItem = null;
const virtualDragPreview = document.createElement('div');
virtualDragPreview.className = 'virtual-drag-preview';
document.body.appendChild(virtualDragPreview);

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

egg.addEventListener('click', function() {
    // Only crack the egg if it's not already cracked
    if (!this.classList.contains('cracked')) {
        // Check if we need to reset any of the arrays
        resetArraysIfNeeded();
        
        // Randomly choose between syllable and non-syllable
        const isSyllable = Math.random() < 0.5;
        
        // Get a random unused item from the appropriate array
        const item = isSyllable 
            ? getRandomItem(remainingSyllables) 
            : getRandomItem(remainingNonSyllables);
        
        // Generate cracks
        generateCracks(this);
        
        // Play only the first half of the cracking sound
        crackSound.currentTime = 0;
        crackSound.play();
        
        // Set a timeout to stop the audio after playing 50% of it
        setTimeout(() => {
            crackSound.pause();
            crackSound.currentTime = 0;
        }, crackSound.duration * 500 || 500); // 50% of the duration (in ms)
        
        // Flash effect before wobble
        this.style.backgroundColor = '#fff9e6';
        setTimeout(() => {
            this.style.backgroundColor = '#ffebcd';
            
            // Add cracking animation
            this.classList.add('cracking');
            
            // Reveal the item after animation completes
            setTimeout(() => {
                this.textContent = item;
                this.classList.remove('cracking');
                this.classList.add('cracked');
                
                // Reset selectedItem to ensure it's not automatically selected
                selectedItem = null;
                virtualDragPreview.style.display = 'none';
            }, 500); // Match animation duration
            
        }, 50); // Short delay for flash effect
    } else {
        // If the egg is already cracked, clicking on it selects the item
        selectedItem = this.textContent;
        
        // Show ghost tracker with the selected item
        virtualDragPreview.textContent = selectedItem;
        virtualDragPreview.style.display = 'block';
        
        // Position the ghost tracker at the click location
        const rect = this.getBoundingClientRect();
        virtualDragPreview.style.left = `${rect.left + rect.width/2}px`;
        virtualDragPreview.style.top = `${rect.top + rect.height/2}px`;
    }
});

document.addEventListener('mousemove', (event) => {
    if (selectedItem) {
        virtualDragPreview.style.left = `${event.clientX}px`;
        virtualDragPreview.style.top = `${event.clientY}px`;
    }
});

[syllableBasket, nonSyllableBasket].forEach(basket => {
    basket.addEventListener('click', function() {
        if (selectedItem) {
            const isSyllable = allSyllables.includes(selectedItem);
            if ((isSyllable && this.id === 'syllable-basket') || (!isSyllable && this.id === 'non-syllable-basket')) {
                const currentItems = this.getAttribute('data-items') || '';
                const updatedItems = currentItems ? `${currentItems}, ${selectedItem}` : selectedItem;
                this.setAttribute('data-items', updatedItems);
                this.querySelector('.items').textContent = updatedItems;

                // Reset the egg
                egg.textContent = '?';
                egg.classList.remove('cracked');
                selectedItem = null;
                virtualDragPreview.style.display = 'none';
            }
        }
    });
});

// Assuming `ghostTracker` is your ghost tracker element
const ghostTracker = document.getElementById('ghostTracker');

document.addEventListener('click', (event) => {
    // Hide the ghost tracker before moving
    ghostTracker.style.display = 'none';

    // Update the position of the ghost tracker to the click location
    ghostTracker.style.left = `${event.clientX}px`;
    ghostTracker.style.top = `${event.clientY}px`;

    // Show the ghost tracker at the new location
    ghostTracker.style.display = 'block';
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

// Restructure the DOM when the page loads
window.addEventListener('DOMContentLoaded', () => {
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
});