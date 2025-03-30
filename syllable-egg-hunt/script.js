// script.js
const egg = document.getElementById('egg');
const syllableBasket = document.getElementById('syllable-basket');
const nonSyllableBasket = document.getElementById('non-syllable-basket');

egg.addEventListener('click', function() {
    const isSyllable = Math.random() < 0.5;
    const items = isSyllable ? ['ran', 'im', 're', 'yes', 'ape', 'he'] : ['fl', 'ip', 'teb', 'yms', 'stre', 'gld', 'br'];
    const item = items[Math.floor(Math.random() * items.length)];
    
    // Reveal the item
    this.textContent = item;
    this.setAttribute('draggable', true);
    this.classList.add('cracked');

    // Drag and drop functionality
    this.addEventListener('dragstart', function(event) {
        event.dataTransfer.setData('text', item);
        const ghostImage = document.createElement('div');
        ghostImage.textContent = item;
        ghostImage.style.position = 'absolute';
        ghostImage.style.top = '-9999px';
        document.body.appendChild(ghostImage);
        event.dataTransfer.setDragImage(ghostImage, 0, 0);
    });
});

[syllableBasket, nonSyllableBasket].forEach(basket => {
    basket.addEventListener('dragover', function(event) {
        event.preventDefault();
    });

    basket.addEventListener('drop', function(event) {
        event.preventDefault();
        const item = event.dataTransfer.getData('text');
        const isSyllable = ['ran', 'im', 're', 'yes', 'ape', 'he'].includes(item);
        if ((isSyllable && this.id === 'syllable-basket') || (!isSyllable && this.id === 'non-syllable-basket')) {
            const newItem = document.createElement('div');
            newItem.textContent = item;
            this.appendChild(newItem);

            // Reset the egg
            egg.textContent = '?';
            egg.removeAttribute('draggable');
            egg.classList.remove('cracked');
        }
    });
});