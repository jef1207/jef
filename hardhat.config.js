// Сохранение в localStorage
function saveGame() {
    localStorage.setItem('gameState', JSON.stringify({
        inventory: gameState.inventory,
        currency: gameState.currency,
        completedQuests: gameState.completedQuests
    }));
}

// Загрузка сохранения
function loadGame() {
    const saved = JSON.parse(localStorage.getItem('gameState'));
    if (saved) {
        gameState.inventory = saved.inventory;
        gameState.currency = saved.currency;
        gameState.completedQuests = saved.completedQuests;
    }
}
