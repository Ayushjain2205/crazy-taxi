// Main game file
import { ROAD } from "./config/gameConfig.js";
import {
  initScene,
  getScene,
  getCamera,
  getRenderer,
  getWorldContainer,
} from "./utils/sceneSetup.js";
import { createEnvironment } from "./components/environment.js";
import {
  createTaxi,
  updateTaxi,
  updateCrashAnimation,
} from "./components/taxi.js";
import { createTraffic, updateTrafficPositions } from "./components/traffic.js";
import {
  setupControls,
  isPlayerAccelerating,
  isPlayerDecelerating,
} from "./utils/controls.js";
import {
  initGameState,
  getGameState,
  getSpeed,
  updateSpeed,
  getWorldZ,
  setWorldZ,
  updateGameState,
  isCrashAnimationActive,
  setCrashAnimationActive,
  updateGameOverAnimationTime,
  handleGameOver,
} from "./utils/gameState.js";
import {
  checkCollisions,
  handleCollision,
  getJumpBonus,
} from "./utils/collision.js";

// Initialize game
function initGame() {
  // Set up scene, camera, renderer
  const { scene, camera, renderer, worldContainer } = initScene();

  // Create environment
  createEnvironment();

  // Create taxi
  createTaxi();

  // Create traffic
  createTraffic();

  // Setup controls
  setupControls();

  // Initialize game state
  initGameState();

  // Start animation loop
  animate(0);
}

// Game loop
let lastTime = 0;

function animate(time) {
  requestAnimationFrame(animate);

  // Calculate delta time
  const deltaTime = (time - lastTime) / 1000;
  lastTime = time;

  const gameState = getGameState();
  const worldContainer = getWorldContainer();
  const camera = getCamera();
  const renderer = getRenderer();

  // Handle crash animation
  if (gameState === "gameover" && isCrashAnimationActive()) {
    updateGameOverAnimationTime(deltaTime);

    // Camera shake effect
    if (getGameOverAnimationTime() < 1.5) {
      camera.position.x = Math.sin(getGameOverAnimationTime() * 30) * 0.3;
    } else {
      camera.position.x = 0;
    }

    // Animate taxi parts flying
    updateCrashAnimation(deltaTime);
  }

  if (gameState !== "playing") {
    renderer.render(getScene(), camera);
    return;
  }

  // Update taxi
  updateTaxi(deltaTime);

  // Update speed based on input
  updateSpeed(deltaTime, isPlayerAccelerating(), isPlayerDecelerating());

  // Move the world toward the player
  worldContainer.position.z -= getSpeed() * deltaTime;

  // Update game state (score, level, etc.)
  const worldZ = updateGameState(deltaTime, getJumpBonus());

  // Check if we need to loop the world
  if (worldZ <= -ROAD.LENGTH) {
    setWorldZ(0);
    worldContainer.position.z = 0;

    // Update traffic positions when world loops
    updateTrafficPositions();
  }

  // Check for collisions
  const { collision, collidedCar } = checkCollisions();

  if (collision) {
    // Collision detected!
    setCrashAnimationActive(true);
    handleCollision(collidedCar);
    handleGameOver();
  }

  // Render the scene
  renderer.render(getScene(), camera);
}

// Start the game when page loads
window.addEventListener("DOMContentLoaded", initGame);
