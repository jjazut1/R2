// script.js
const egg = document.getElementById('egg');
const syllableBasket = document.getElementById('syllable-basket');
const nonSyllableBasket = document.getElementById('non-syllable-basket');
let selectedItem = null;

egg.addEventListener('click', function() {
    const isSyllable = Math.random() < 0.5;
    const items = isSyllable ? ['ran', 'im', 're', 'yes', 'ape', 'he'] : ['fl', 'ip', 'teb', 'yms', 'stre', 'gld', 'br'];
    const item = items[Math.floor(Math.random() * items.length)];
    
    // Reveal the item
    this.textContent = item;
    selectedItem = item;
    this.classList.add('cracked');
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
            }
        }
    });
});