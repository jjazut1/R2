// script.js
document.querySelectorAll('.egg').forEach(egg => {
    egg.addEventListener('click', function() {
        const type = this.getAttribute('data-type');
        const items = type === 'syllable' ? ['ran', 'im', 're', 'yes', 'ape', 'he'] : ['fl', 'ip', 'teb', 'yms', 'stre', 'gld', 'br'];
        const item = items[Math.floor(Math.random() * items.length)];
        
        // Reveal the item
        this.textContent = item;
        this.style.pointerEvents = 'none'; // Disable further clicks

        // Allow the item to be moved to the basket
        this.addEventListener('click', function() {
            const collectedItems = document.getElementById('collected-items');
            const newItem = document.createElement('div');
            newItem.textContent = item;
            newItem.className = 'collected-item';
            collectedItems.appendChild(newItem);
        });
    });
});