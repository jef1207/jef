// Основные переменные
let scene, camera, renderer, cube, cubeBody, world;
let crystals = [];
let score = 0;
let gameTime = 60;
let gameActive = false;
const tg = window.Telegram.WebApp;

// Инициализация игры
function init() {
    // Настройка сцены Three.js
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // Голубой фон
    
    // Камера
    camera = new THREE.PerspectiveCamera(
        75, 
        window.innerWidth / window.innerHeight, 
        0.1, 
        1000
    );
    camera.position.set(0, 5, 10);
    
    // Рендерер
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
    
    // Физический мир
    world = new CANNON.World();
    world.gravity.set(0, -9.82, 0);
    
    // Создание игровых объектов
    createFloor();
    createPlayer();
    createLighting();
    
    // Обработчики событий
    document.getElementById('start-btn').addEventListener('click', startGame);
    document.getElementById('restart-btn').addEventListener('click', restartGame);
    
    // Адаптация под размер экрана
    window.addEventListener('resize', onWindowResize);
    
    // Инициализация Telegram Web App
    tg.ready();
    tg.expand();
    tg.MainButton.hide();
    
    // Запуск анимации
    animate();
}

// Создание пола
function createFloor() {
    const floorGeometry = new THREE.PlaneGeometry(20, 20);
    const floorMaterial = new THREE.MeshPhongMaterial({ color: 0x2E8B57 });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);
    
    const floorBody = new CANNON.Body({ mass: 0 });
    floorBody.addShape(new CANNON.Plane());
    floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    world.addBody(floorBody);
}

// Создание игрока
function createPlayer() {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshPhongMaterial({ color: 0x00FF00 });
    cube = new THREE.Mesh(geometry, material);
    cube.position.y = 1;
    scene.add(cube);
    
    cubeBody = new CANNON.Body({ mass: 1 });
    cubeBody.addShape(new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5)));
    cubeBody.position.set(0, 1, 0);
    world.addBody(cubeBody);
}

// Освещение
function createLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);
}

// Генерация кристаллов
function createCrystal() {
    const geometry = new THREE.OctahedronGeometry(0.5);
    const material = new THREE.MeshStandardMaterial({ 
        color: 0xFFD700,
        emissive: 0x222200,
        metalness: 0.7,
        roughness: 0.3
    });
    
    const crystal = new THREE.Mesh(geometry, material);
    
    // Случайная позиция
    crystal.position.x = (Math.random() - 0.5) * 15;
    crystal.position.z = (Math.random() - 0.5) * 15;
    crystal.position.y = 1;
    
    scene.add(crystal);
    crystals.push(crystal);
}

// Игровая механика
function gameLoop() {
    if (!gameActive) return;
    
    // Обновление физики
    world.step(1/60);
    
    // Синхронизация 3D объектов
    cube.position.copy(cubeBody.position);
    cube.quaternion.copy(cubeBody.quaternion);
    
    // Обработка кристаллов
    crystals.forEach((crystal, index) => {
        crystal.rotation.y += 0.03;
        
        // Проверка коллизии
        if (cube.position.distanceTo(crystal.position) < 1.2) {
            scene.remove(crystal);
            crystals.splice(index, 1);
            updateScore(10);
            createCrystal();
        }
    });
    
    // Обновление таймера
    updateTimer();
}

// Управление
function setupControls() {
    if (window.DeviceOrientationEvent) {
        // Мобильное управление (наклон)
        window.addEventListener('deviceorientation', handleOrientation);
    } else {
        // Клавиатура (для десктопов)
        document.addEventListener('keydown', handleKeyPress);
    }
}

function handleOrientation(event) {
    const tiltX = clamp(event.gamma / 30, -1, 1);
    const tiltZ = clamp((event.beta - 90) / 30, -1, 1);
    
    cubeBody.velocity.x = tiltX * 5;
    cubeBody.velocity.z = tiltZ * 5;
}

// Обновление счета
function updateScore(points) {
    score += points;
    document.getElementById('score').textContent = `Счёт: ${score}`;
}

// Таймер игры
function updateTimer() {
    gameTime--;
    document.getElementById('timer').textContent = `Время: ${gameTime}`;
    
    if (gameTime <= 0) {
        endGame();
    }
}

// Запуск игры
function startGame() {
    document.getElementById('start-screen').classList.add('hidden');
    gameActive = true;
    
    // Создать начальные кристаллы
    for (let i = 0; i < 5; i++) {
        createCrystal();
    }
    
    // Настройка управления
    setupControls();
    
    // Запуск игрового таймера
    setInterval(() => {
        if (gameActive) gameLoop();
    }, 1000);
}

// Завершение игры
function endGame() {
    gameActive = false;
    document.getElementById('final-score').textContent = score;
    document.getElementById('end-screen').classList.remove('hidden');
    
    // Отправка результата в Telegram
    if (tg.initDataUnsafe.user) {
        tg.sendData(JSON.stringify({
            score: score,
            userId: tg.initDataUnsafe.user.id
        }));
    }
}

// Вспомогательные функции
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

// Главный цикл анимации
function animate() {
    requestAnimationFrame(animate);
    if (gameActive) {
        renderer.render(scene, camera);
    }
}

// Инициализация при загрузке
window.onload = init;
