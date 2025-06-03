// Инициализация сцены
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Физический мир
const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);

// Игровой куб
const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
const cubeMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
scene.add(cube);

// Физическое тело игрока
const cubeBody = new CANNON.Body({ mass: 1 });
cubeBody.addShape(new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5)));
world.addBody(cubeBody);

// Освещение
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 7);
scene.add(light);

// Кристаллы для сбора
const crystals = [];
function createCrystal() {
  const geometry = new THREE.OctahedronGeometry(0.5);
  const material = new THREE.MeshStandardMaterial({ color: 0xffaa00, emissive: 0x222200 });
  const crystal = new THREE.Mesh(geometry, material);
  
  // Случайная позиция
  crystal.position.x = (Math.random() - 0.5) * 10;
  crystal.position.z = (Math.random() - 0.5) * 10;
  crystal.position.y = 1;
  
  scene.add(crystal);
  crystals.push(crystal);
}

// Управление через Telegram интерфейс
const tg = window.Telegram.WebApp;
tg.MainButton.setText("ИГРАТЬ").show();

tg.onEvent('mainButtonClicked', () => {
  // Логика старта игры
});

// Игровой цикл
function animate() {
  requestAnimationFrame(animate);
  
  // Обновление физики
  world.step(1/60);
  
  // Синхронизация 3D объектов с физикой
  cube.position.copy(cubeBody.position);
  cube.quaternion.copy(cubeBody.quaternion);
  
  // Проверка коллизий с кристаллами
  crystals.forEach((crystal, index) => {
    crystal.rotation.y += 0.02;
    if (cube.position.distanceTo(crystal.position) < 1) {
      scene.remove(crystal);
      crystals.splice(index, 1);
      score++;
      document.getElementById('score').innerText = `Score: ${score}`;
    }
  });
  
  renderer.render(scene, camera);
}
animate();
