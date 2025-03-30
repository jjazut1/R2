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

egg.addEventListener('click', function() {
    // Only crack the egg if it's not already cracked
    if (!this.classList.contains('cracked')) {
        const isSyllable = Math.random() < 0.5;
        const items = isSyllable ? ['ran', 'im', 're', 'yes', 'ape', 'he'] : ['fl', 'ip', 'teb', 'yms', 'stre', 'gld', 'br'];
        const item = items[Math.floor(Math.random() * items.length)];
        
        // Play cracking sound
        crackSound.currentTime = 0;
        crackSound.play();
        
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
            const isSyllable = ['ran', 'im', 're', 'yes', 'ape', 'he'].includes(selectedItem);
            if ((isSyllable && this.id === 'syllable-basket') || (!isSyllable && this.id === 'non-syllable-basket')) {
                const currentItems = this.getAttribute('data-items') || '';
                const updatedItems = currentItems ? `${currentItems}, ${selectedItem}` : selectedItem;
                this.setAttribute('data-items', updatedItems);
                this.querySelector('.items').textContent = updatedItems;

                // Reset the egg
                egg.textContent = '?';
                egg.classList.remove('cracked');
                selectedItem = null;

                // Hide the ghost tracker after drop
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