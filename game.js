// Инициализация Telegram Web App
const tg = window.Telegram.WebApp;
tg.expand(); // Активируем полноэкранный режим
tg.enableClosingConfirmation(); // Подтверждение при закрытии

// Настройки игры
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const restartButton = document.getElementById('restart');

// Размеры поля
const gridSize = 20;
let snake = [{x: 10, y: 10}];
let food = generateFood();
let dx = 1;
let dy = 0;
let score = 0;
let gameSpeed = 150;
let gameRunning = true;

// Настройка canvas
function setupCanvas() {
    canvas.width = window.innerWidth - (window.innerWidth % gridSize);
    canvas.height = window.innerHeight - (window.innerHeight % gridSize);
}
setupCanvas();
window.addEventListener('resize', setupCanvas);

// Генерация еды
function generateFood() {
    return {
        x: Math.floor(Math.random() * (canvas.width / gridSize)),
        y: Math.floor(Math.random() * (canvas.height / gridSize))
    };
}

// Основной игровой цикл
function gameLoop() {
    if (!gameRunning) return;
    
    moveSnake();
    checkCollision();
    drawGame();
    setTimeout(gameLoop, gameSpeed);
}

// Движение змейки
function moveSnake() {
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    snake.unshift(head);
    
    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreElement.textContent = `Счет: ${score}`;
        food = generateFood();
    } else {
        snake.pop();
    }
}

// Проверка столкновений
function checkCollision() {
    const head = snake[0];
    
    // Стены
    if (
        head.x < 0 || 
        head.x >= canvas.width / gridSize ||
        head.y < 0 || 
        head.y >= canvas.height / gridSize
    ) {
        gameOver();
    }
    
    // Сама змея
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            gameOver();
        }
    }
}

// Отрисовка игры
function drawGame() {
    // Очистка экрана
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Змейка
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? '#4CAF50' : '#8BC34A';
        ctx.fillRect(
            segment.x * gridSize, 
            segment.y * gridSize, 
            gridSize - 1, 
            gridSize - 1
        );
    });
    
    // Еда
    ctx.fillStyle = '#FF5252';
    ctx.fillRect(
        food.x * gridSize, 
        food.y * gridSize, 
        gridSize, 
        gridSize
    );
}

// Конец игры
function gameOver() {
    gameRunning = false;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'white';
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Конец игры!', canvas.width / 2, canvas.height / 2);
    ctx.font = '30px Arial';
    ctx.fillText(`Счет: ${score}`, canvas.width / 2, canvas.height / 2 + 50);
}

// Управление
document.addEventListener('keydown', e => {
    switch (e.key) {
        case 'ArrowUp': if (dy === 0) { dx = 0; dy = -1; } break;
        case 'ArrowDown': if (dy === 0) { dx = 0; dy = 1; } break;
        case 'ArrowLeft': if (dx === 0) { dx = -1; dy = 0; } break;
        case 'ArrowRight': if (dx === 0) { dx = 1; dy = 0; } break;
    }
});

// Свайпы для мобильных устройств
let touchStartX, touchStartY;

canvas.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

canvas.addEventListener('touchend', e => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;
    
    if (Math.abs(diffX) > Math.abs(diffY)) {
        // Горизонтальный свайп
        if (diffX > 0 && dx === 0) dx = 1; // Вправо
        else if (diffX < 0 && dx === 0) dx = -1; // Влево
    } else {
        // Вертикальный свайп
        if (diffY > 0 && dy === 0) dy = 1; // Вниз
        else if (diffY < 0 && dy === 0) dy = -1; // Вверх
    }
});

// Перезапуск игры
restartButton.addEventListener('click', () => {
    snake = [{x: 10, y: 10}];
    dx = 1;
    dy = 0;
    score = 0;
    scoreElement.textContent = `Счет: ${score}`;
    food = generateFood();
    gameRunning = true;
    gameLoop();
});

// Запуск игры
gameLoop();
