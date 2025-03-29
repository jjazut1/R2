document.getElementById('startGame').addEventListener('click', startGame);

let currentPlayer = 1;
let playedCardsCount = 0;

function startGame() {
    // Clear played cards
    const playedCardsDiv = document.getElementById('playedCards');
    playedCardsDiv.innerHTML = '';

    const cards = [
        'https://jjazut1.github.io/image-hosting/squirrel holding a present.webp',
        'https://jjazut1.github.io/image-hosting/songbird soaring above castle.webp',
        'https://jjazut1.github.io/image-hosting/raccoon holding a gold key.webp',
        'https://jjazut1.github.io/image-hosting/raccoon holding a gold key.webp',
        'https://jjazut1.github.io/image-hosting/raccoon holding a gold key.webp',
        'https://jjazut1.github.io/image-hosting/raccoon holding a gold key.webp',
        'https://jjazut1.github.io/image-hosting/raccoon holding a gold key.webp'
    ];
    shuffle(cards);

    const player1Cards = cards.slice(0, 3);
    const player2Cards = cards.slice(3, 6);

    displayCards('player1', player1Cards);
    displayCards('player2', player2Cards);

    document.querySelectorAll('.cards img').forEach(img => {
        img.addEventListener('click', () => playCard(img));
    });
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
        cardElement.src = 'facedown.webp'; // Correct path to the facedown image
        cardElement.dataset.card = card;
        playerDiv.appendChild(cardElement);
    });
}

function playCard(cardElement) {
    const playedCardsDiv = document.getElementById('playedCards');
    if (playedCardsDiv.children.length < 6 && isCurrentPlayerCard(cardElement)) {
        cardElement.src = cardElement.dataset.card; // Flip to show the actual card
        playedCardsDiv.appendChild(cardElement);
        playedCardsCount++;
        switchPlayer();
    }
}

function isCurrentPlayerCard(cardElement) {
    const playerDiv = cardElement.closest('.player');
    return (currentPlayer === 1 && playerDiv.id === 'player1') ||
           (currentPlayer === 2 && playerDiv.id === 'player2');
}

function switchPlayer() {
    currentPlayer = currentPlayer === 1 ? 2 : 1;
}
