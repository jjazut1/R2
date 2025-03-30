// game.js
const egg = document.getElementById('egg');
const syllableBasket = document.getElementById('syllable-basket');
const nonSyllableBasket = document.getElementById('non-syllable-basket');
let selectedItem = null;
const virtualDragPreview = document.createElement('div');
virtualDragPreview.className = 'virtual-drag-preview';
document.body.appendChild(virtualDragPreview);

egg.addEventListener('click', function() {
    const isSyllable = Math.random() < 0.5;
    const items = isSyllable ? ['ran', 'im', 're', 'yes', 'ape', 'he'] : ['fl', 'ip', 'teb', 'yms', 'stre', 'gld', 'br'];
    const item = items[Math.floor(Math.random() * items.length)];
    
    // Reveal the item without selecting it
    this.textContent = item;
    this.classList.add('cracked');

    // Show ghost tracker with the item
    virtualDragPreview.textContent = item;
    virtualDragPreview.style.display = 'block';

    // Reset selectedItem
    selectedItem = null;
});

// Add a click event to select the item after it has been revealed
virtualDragPreview.addEventListener('click', function() {
    if (egg.classList.contains('cracked')) {
        selectedItem = this.textContent;
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