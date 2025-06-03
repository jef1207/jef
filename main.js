// main.js
import * as THREE from 'three';

// 1. Инициализация Telegram Web App
const tg = window.Telegram.WebApp;
tg.ready(); // Говорим Telegram, что приложение готово к показу

// Элементы DOM
const userNameEl = document.getElementById('userName');
const scoreBoardEl = document.getElementById('scoreBoard');
const timerEl = document.getElementById('timer');
const canvas = document.getElementById('gameCanvas');

// Покажем имя пользователя
if (tg.initDataUnsafe.user) {
    const user = tg.initDataUnsafe.user;
    userNameEl.textContent = `Игрок: ${user.first_name || 'Аноним'}`;
}

// 2. Настройка Three.js
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio); // Важно для мобилок!

// Базовый свет
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// Пол (простая плоскость)
const floorGeometry = new THREE.PlaneGeometry(10, 10);
const floorMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// 3. Игровые переменные
let score = 0;
let timeLeft = 30;
let gameActive = false;
const cubes = [];
const cubeGeometry = new THREE.BoxGeometry(1, 1, 1); // Одна геометрия для всех кубов!

// 4. Telegram Main Button
const playButton = tg.MainButton;
playButton.setText("ИГРАТЬ!");
playButton.show();
playButton.onClick(() => {
    startGame();
});

// 5. Запуск игры
function startGame() {
    score = 0;
    timeLeft = 30;
    gameActive = true;
    updateScore();
    updateTimer();
    playButton.hide();
    // Очистить старые кубы (если есть)
    cubes.forEach(cube => scene.remove(cube));
    cubes.length = 0;
    // Создать первый куб
    spawnCube();
    // Запустить игровой цикл (если еще не запущен)
    animate();
    // Запустить таймер
    gameTimer = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            updateTimer();
        } else {
            endGame();
        }
    }, 1000);
}

// 6. Создание куба
function spawnCube() {
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff];
    const cubeMaterial = new THREE.MeshPhongMaterial({ 
        color: colors[Math.floor(Math.random() * colors.length)] 
    });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    // Случайная позиция на полу (X, Z). Y = 0.5 (половина высоты куба)
    cube.position.x = (Math.random() - 0.5) * 8;
    cube.position.z = (Math.random() - 0.5) * 8;
    cube.position.y = 0.5;
    scene.add(cube);
    cubes.push(cube);
}

// 7. Raycaster для кликов
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

function onPointerDown(event) {
    if (!gameActive) return;

    // Получить координаты клика в нормализованных координатах устройства (-1 to +1)
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = - (event.clientY / window.innerHeight) * 2 + 1;

    // Обновить луч (raycaster) из камеры через указатель
    raycaster.setFromCamera(pointer, camera);

    // Проверить пересечения с кубами
    const intersects = raycaster.intersectObjects(cubes);

    if (intersects.length > 0) {
        // Кликнули по первому пересеченному кубу
        const clickedCube = intersects[0].object;
        // Удалить куб из сцены и массива
        scene.remove(clickedCube);
        const index = cubes.indexOf(clickedCube);
        if (index > -1) {
            cubes.splice(index, 1);
        }
        // Увеличить счет
        score++;
        updateScore();
        // Создать новый куб
        spawnCube();
    }
}
canvas.addEventListener('pointerdown', onPointerDown); // Работает и для мыши и для тача

// 8. Обновление UI
function updateScore() {
    scoreBoardEl.textContent = `Счет: ${score}`;
}

function updateTimer() {
    timerEl.textContent = timeLeft;
}

// 9. Завершение игры
function endGame() {
    gameActive = false;
    clearInterval(gameTimer);
    playButton.setText("ИГРАТЬ СНОВА!");
    playButton.show();

    // Простейшее сохранение лучшего счета (локальное)
    const bestScore = localStorage.getItem('bestScore') || 0;
    if (score > bestScore) {
        localStorage.setItem('bestScore', score);
        // Можно показать сообщение "Новый рекорд!"
    }

    // Показать результат и кнопку "Поделиться"
    tg.showAlert(`Игра окончена! Ваш счет: ${score}. Рекорд: ${localStorage.getItem('bestScore') || 0}`);
}

// 10. Игровой цикл рендеринга
function animate() {
    requestAnimationFrame(animate);
    // Здесь можно добавить простую анимацию кубов (вращение?), но для MVP можно и без нее
    renderer.render(scene, camera);
}

// 11. Обработка ресайза окна (важно для TMA!)
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onWindowResize);
