// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add lights to the scene
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(0, 10, 0);
scene.add(directionalLight);

// Create the road
const roadGeometry = new THREE.PlaneGeometry(12, 10000);
const roadMaterial = new THREE.MeshBasicMaterial({ color: 0x888888 });
const road = new THREE.Mesh(roadGeometry, roadMaterial);
road.rotation.x = -Math.PI / 2;
road.position.y = 0;
scene.add(road);

// Create the taxi (yellow box)
const taxiGeometry = new THREE.BoxGeometry(2, 1, 4);
const taxiMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const taxi = new THREE.Mesh(taxiGeometry, taxiMaterial);
taxi.position.set(0, 0.5, 0);
scene.add(taxi);
let taxiLane = 1; // 0 = left, 1 = middle, 2 = right
const lanePositions = [4, 0, -4];
let taxiSpeed = 10; // Starting speed
const minSpeed = 10;
const maxSpeed = 100;

// Create traffic cars (red boxes)
const trafficCars = [];
function createTrafficCar() {
  const car = new THREE.Mesh(
    new THREE.BoxGeometry(2, 1, 4),
    new THREE.MeshBasicMaterial({ color: 0xff0000 })
  );
  car.position.set(
    lanePositions[Math.floor(Math.random() * 3)],
    0.5,
    taxi.position.z + 20 + Math.random() * 30
  );
  car.speed = 0.8 * taxiSpeed + (Math.random() - 0.5) * 20;
  trafficCars.push(car);
  scene.add(car);
}
for (let i = 0; i < 10; i++) {
  createTrafficCar();
}

// Game variables
let gameState = "start";
let level = 1;
let timeLimit = 60; // seconds
let remainingTime = timeLimit;
let score = 0;
let jumpBonus = 0;
let isAccelerating = false;
let isDecelerating = false;
let isJumping = false;
let jumpTime = 0;
const jumpDuration = 1; // second
const maxJumpHeight = 2;
let timerInterval;

// UI elements
const instructionsDiv = document.getElementById("instructions");
const levelInfoDiv = document.getElementById("level-info");
const startButton = document.getElementById("start-button");
const beginButton = document.getElementById("begin-button");
const levelSpan = document.getElementById("level");
const timeLimitSpan = document.getElementById("time-limit");
const scoreDiv = document.getElementById("score");
const timerDiv = document.getElementById("timer");

// Set initial UI values
levelSpan.textContent = level;
timeLimitSpan.textContent = timeLimit;
timerDiv.textContent = "Time: " + remainingTime;

// Handle start button clicks
startButton.addEventListener("click", () => {
  instructionsDiv.style.display = "none";
  levelInfoDiv.style.display = "flex";
});

beginButton.addEventListener("click", () => {
  levelInfoDiv.style.display = "none";
  gameState = "playing";
  timerInterval = setInterval(() => {
    remainingTime--;
    timerDiv.textContent = "Time: " + remainingTime;
    if (remainingTime <= 0) {
      gameState = "gameover";
      clearInterval(timerInterval);
      console.log("Time's up! Game Over. Score: " + score);
    }
  }, 1000);
});

// Controls
window.addEventListener("keydown", (e) => {
  if (e.repeat) return;
  if (e.key === "ArrowLeft" && taxiLane > 0) {
    taxiLane--;
  } else if (e.key === "ArrowRight" && taxiLane < 2) {
    taxiLane++;
  } else if (e.key === "ArrowUp") {
    isAccelerating = true;
  } else if (e.key === "ArrowDown") {
    isDecelerating = true;
  } else if (e.key === " ") {
    if (!isJumping) {
      isJumping = true;
      jumpTime = 0;
    }
  }
});

window.addEventListener("keyup", (e) => {
  if (e.key === "ArrowUp") {
    isAccelerating = false;
  } else if (e.key === "ArrowDown") {
    isDecelerating = false;
  }
});

// Game loop
let lastTime = 0;
function animate(time) {
  requestAnimationFrame(animate);
  if (gameState !== "playing") return;

  const deltaTime = (time - lastTime) / 1000;
  lastTime = time;

  // Update taxi speed
  if (isAccelerating) {
    taxiSpeed += 20 * deltaTime;
    if (taxiSpeed > maxSpeed) taxiSpeed = maxSpeed;
  } else if (isDecelerating) {
    taxiSpeed -= 20 * deltaTime;
    if (taxiSpeed < minSpeed) taxiSpeed = minSpeed;
  }

  // Update taxi position
  taxi.position.z += taxiSpeed * deltaTime;
  taxi.position.x = lanePositions[taxiLane];

  // Update jumping
  if (isJumping) {
    jumpTime += deltaTime;
    if (jumpTime > jumpDuration) {
      isJumping = false;
      jumpTime = 0;
    } else {
      const fraction = jumpTime / jumpDuration;
      taxi.position.y = 0.5 + 4 * maxJumpHeight * fraction * (1 - fraction);
    }
  } else {
    taxi.position.y = 0.5;
  }

  // Update traffic cars
  trafficCars.forEach((car) => {
    car.position.z += car.speed * deltaTime;
    if (car.position.z < taxi.position.z - 50) {
      car.position.z = taxi.position.z + 50;
      car.position.x = lanePositions[Math.floor(Math.random() * 3)];
      car.speed = 0.8 * taxiSpeed + (Math.random() - 0.5) * 20;
    }
  });

  // Update camera
  camera.position.set(0, 5, taxi.position.z - 10);
  camera.lookAt(0, 0, taxi.position.z);

  // Check for collisions and jumps
  jumpBonus = 0;
  trafficCars.forEach((car) => {
    if (
      car.position.x === taxi.position.x &&
      Math.abs(car.position.z - taxi.position.z) < 4
    ) {
      if (isJumping) {
        jumpBonus += 1; // Award 1 point per frame while jumping over car
      } else {
        // Collision
        gameState = "gameover";
        clearInterval(timerInterval);
        console.log("Game Over! Score: " + score);
      }
    }
  });

  // Update score
  score = Math.floor(taxi.position.z) + jumpBonus;
  scoreDiv.textContent = "Score: " + score;

  // Check for level advancement
  if (taxi.position.z >= 1000 * level) {
    level += 1;
    remainingTime += 30;
    timerDiv.textContent = "Time: " + remainingTime;
    // Add more traffic cars
    for (let i = 0; i < 5; i++) {
      createTrafficCar();
    }
  }

  renderer.render(scene, camera);
}
animate(0);
