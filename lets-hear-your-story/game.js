document.getElementById('startGame').addEventListener('click', startGame);

function startGame() {
    // Initialize game state
    //https://jjazut1.github.io/image-hosting/grassv2nbg.png
    const cards = [
        'card1.webp', 'card2.webp', 'card3.webp', // Add more card images
    ];
    shuffle(cards);

    // Deal cards to players
    const player1Cards = cards.slice(0, 3);
    const player2Cards = cards.slice(3, 6);

    // Display cards facedown
    displayCards('player1', player1Cards);
    displayCards('player2', player2Cards);

    // Add event listeners for card flipping and storytelling
    // ...
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function displayCards(playerId, cards) {
    const playerDiv = document.getElementById(playerId).querySelector('.cards');
    playerDiv.innerHTML = '';
    cards.forEach(card => {
        const cardElement = document.createElement('img');
        cardElement.src = 'path/to/facedown/image.webp'; // Placeholder for facedown card
        cardElement.dataset.card = card;
        playerDiv.appendChild(cardElement);
    });
}