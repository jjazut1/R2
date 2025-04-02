// game.js
// First declare all the shared variables and functions
let selectedItem = null;
const virtualDragPreview = document.createElement('div');
virtualDragPreview.className = 'virtual-drag-preview';
document.body.appendChild(virtualDragPreview);

const crackSound = document.createElement('audio');
crackSound.src = 'https://github.com/jjazut1/sound-hosting/raw/refs/heads/main/break.mp3';
crackSound.id = 'breakSound';
document.body.appendChild(crackSound);

// Add a variable to store the current game configuration
let currentGameConfig = null;

// Add variables to track available items for each category
let availableItems = new Map(); // Will store arrays of unused items for each category

// Add game state tracking
let totalEggs = 0;
let crackedEggs = 0;

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

// Create the game update functions
function updateEggs(quantity) {
    totalEggs = quantity;
    crackedEggs = 0;
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = '';
    
    for (let i = 0; i < quantity; i++) {
        const egg = document.createElement('div');
        egg.className = 'egg';
        egg.id = `egg-${i}`;
        egg.textContent = '?';
        gameBoard.appendChild(egg);
        
        egg.addEventListener('click', handleEggClick);
    }

    // Add game status display
    const statusDiv = document.createElement('div');
    statusDiv.id = 'gameStatus';
    statusDiv.className = 'game-status';
    gameBoard.appendChild(statusDiv);
    updateGameStatus();
}

// Update the updateCategories function to store the config
function updateCategories(categories) {
    currentGameConfig = categories;
    availableItems.clear();

    // Initialize available items for each category
    categories.forEach(category => {
        let itemsList;
        if (typeof category.items === 'string') {
            // If items is a string, split by comma
            itemsList = category.items.split(',').map(item => item.trim());
        } else if (Array.isArray(category.items)) {
            // If items is already an array, use it directly
            itemsList = [...category.items]; // Create a copy of the array
        } else {
            console.error('Invalid category items format:', category);
            itemsList = [];
        }
        availableItems.set(category.name, itemsList);
    });

    const basketsContainer = document.getElementById('baskets');
    basketsContainer.innerHTML = '';

    categories.forEach(category => {
        const basket = document.createElement('div');
        basket.className = 'basket';
        basket.id = `basket-${category.name.toLowerCase().replace(/\s+/g, '-')}`;
        basket.setAttribute('data-items', '');
        
        basket.innerHTML = `
            <div class="title">${category.name}</div>
            <div class="items"></div>
        `;
        
        basketsContainer.appendChild(basket);
        basket.addEventListener('click', handleBasketClick);
    });
}

// Helper function to get random item from a category
function getRandomItem() {
    const availableCategories = Array.from(availableItems.entries())
        .filter(([_, items]) => items.length > 0);

    if (availableCategories.length === 0) {
        // All items have been used, reset available items
        currentGameConfig.forEach(category => {
            let itemsList;
            if (typeof category.items === 'string') {
                itemsList = category.items.split(',').map(item => item.trim());
            } else if (Array.isArray(category.items)) {
                itemsList = [...category.items];
            } else {
                itemsList = [];
            }
            availableItems.set(category.name, itemsList);
        });
        return getRandomItem();
    }

    const randomCategoryIndex = Math.floor(Math.random() * availableCategories.length);
    const [categoryName, categoryItems] = availableCategories[randomCategoryIndex];

    const randomItemIndex = Math.floor(Math.random() * categoryItems.length);
    const selectedItem = categoryItems[randomItemIndex];
    
    categoryItems.splice(randomItemIndex, 1);

    return {
        category: categoryName,
        item: selectedItem
    };
}

// Modify handleEggClick to use the new random item selection
function handleEggClick() {
    // Only allow interaction if egg is not cracked
    if (!this.classList.contains('cracked')) {
        if (currentGameConfig && currentGameConfig.length > 0) {
            const randomSelection = getRandomItem();
            
            generateCracks(this);
            
            crackSound.currentTime = 0;
            crackSound.play();
            
            this.style.backgroundColor = '#fff9e6';
            setTimeout(() => {
                this.style.backgroundColor = '#ffebcd';
                this.classList.add('cracking');
                
                setTimeout(() => {
                    this.textContent = randomSelection.item;
                    this.classList.remove('cracking');
                    this.classList.add('cracked');
                    this.setAttribute('data-category', randomSelection.category);
                    
                    // Automatically select the item when egg cracks
                    selectedItem = randomSelection.item;
                    selectedItemCategory = randomSelection.category;
                    virtualDragPreview.textContent = selectedItem;
                    virtualDragPreview.style.display = 'block';
                    
                    // Position the ghost tracker at the cracked egg
                    const rect = this.getBoundingClientRect();
                    virtualDragPreview.style.left = `${rect.left + rect.width/2}px`;
                    virtualDragPreview.style.top = `${rect.top + rect.height/2}px`;
                    
                    crackedEggs++;
                    updateGameStatus();
                }, 500);
                
            }, 50);
        }
    }
}

function updateBaskets(quantity) {
    const basketsContainer = document.getElementById('baskets');
    basketsContainer.innerHTML = '';
    
    for (let i = 0; i < quantity; i++) {
        const basket = document.createElement('div');
        basket.className = 'basket';
        basket.id = `basket-${i}`;
        basket.setAttribute('data-items', '');
        
        basket.innerHTML = `
            <div class="title">Category ${i + 1}</div>
            <div class="items"></div>
        `;
        
        basketsContainer.appendChild(basket);
        basket.addEventListener('click', handleBasketClick);
    }
}

// Update handleBasketClick to use the current configuration
function handleBasketClick() {
    if (selectedItem) {
        const basketCategory = this.querySelector('.title').textContent;
        const isCorrectCategory = selectedItemCategory === basketCategory;
        
        if (isCorrectCategory) {
            const currentItems = this.getAttribute('data-items') || '';
            const updatedItems = currentItems ? `${currentItems}, ${selectedItem}` : selectedItem;
            this.setAttribute('data-items', updatedItems);
            this.querySelector('.items').textContent = updatedItems;

            // Reset the egg
            const eggs = document.querySelectorAll('.egg.cracked');
            eggs.forEach(egg => {
                if (egg.textContent === selectedItem) {
                    egg.textContent = '?';
                    egg.classList.remove('cracked');
                    egg.removeAttribute('data-category');
                }
            });
            
            selectedItem = null;
            selectedItemCategory = null;
            virtualDragPreview.style.display = 'none';
        }
    }
}

// Add variable to track selected item's category
let selectedItemCategory = null;

// Initialize mouse move handler
document.addEventListener('mousemove', (event) => {
    if (selectedItem) {
        virtualDragPreview.style.left = `${event.clientX}px`;
        virtualDragPreview.style.top = `${event.clientY}px`;
    }
});

function updateGameStatus() {
    const statusDiv = document.getElementById('gameStatus');
    if (statusDiv) {
        statusDiv.textContent = `Eggs Cracked: ${crackedEggs}/${totalEggs}`;
        
        if (crackedEggs === totalEggs) {
            showGameComplete();
        }
    }
}

function showGameComplete() {
    // Create completion overlay
    const overlay = document.createElement('div');
    overlay.className = 'game-complete-overlay';
    overlay.innerHTML = `
        <div class="game-complete-message">
            <h2>Game Complete!</h2>
            <p>All eggs have been cracked.</p>
            <button id="playAgain">Play Again</button>
        </div>
    `;
    document.body.appendChild(overlay);

    // Add play again functionality
    document.getElementById('playAgain').addEventListener('click', () => {
        overlay.remove();
        resetGame();
    });
}

function resetGame() {
    // Reset game state
    crackedEggs = 0;
    selectedItem = null;
    virtualDragPreview.style.display = 'none';
    
    // Clear baskets
    document.querySelectorAll('.basket').forEach(basket => {
        basket.setAttribute('data-items', '');
        basket.querySelector('.items').textContent = '';
    });
    
    // Reinitialize eggs
    updateEggs(totalEggs);
}

// Export the necessary functions and variables
export { updateEggs, updateBaskets, updateCategories };