// Main game file
import { ROAD, GAME } from "./config/gameConfig.js";
import {
  initScene,
  getScene,
  getCamera,
  getRenderer,
  getWorldContainer,
} from "./utils/sceneSetup.js";
import { createEnvironment, getFinishLine } from "./components/environment.js";
import {
  createTaxi,
  updateTaxi,
  updateCrashAnimation,
  getTaxi,
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
  getGameOverAnimationTime,
  handleGameOver,
  handleVictory,
  advanceToNextLevel,
  addTimeBonus,
  addScore,
} from "./utils/gameState.js";
import {
  checkCollisions,
  handleCollision,
  getJumpBonus,
} from "./utils/collision.js";
import {
  spawnCollectibles,
  updateCollectibles,
  resetCollectibles,
  cleanupCollectibles,
  getSpeedBoostMultiplier,
  isInvincible,
} from "./components/collectibles.js";

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

  // Spawn initial collectibles
  resetCollectibles();

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

  // If game is over (either crash or victory), just render and return
  if (gameState !== "playing") {
    renderer.render(getScene(), camera);
    return;
  }

  // Update taxi
  updateTaxi(deltaTime);

  // Update collectibles
  updateCollectibles(deltaTime);

  // Update speed based on input and power-ups
  const speedMultiplier = getSpeedBoostMultiplier();
  updateSpeed(
    deltaTime,
    isPlayerAccelerating(),
    isPlayerDecelerating(),
    speedMultiplier
  );

  // Move the world toward the player
  worldContainer.position.z -= getSpeed() * deltaTime;

  // Check for collisions and finish line crossing
  const {
    collision,
    collidedCar,
    finishLineCrossed,
    collectedCoins,
    timeBonus,
  } = checkCollisions();

  // Handle collectibles
  if (collectedCoins > 0) {
    addScore(collectedCoins);
  }
  if (timeBonus > 0) {
    addTimeBonus(timeBonus);
  }

  // Handle finish line crossing
  if (finishLineCrossed) {
    console.log("=== FINISH LINE CROSSED IN GAME LOOP ===");
    console.log("Game state before advancing:", gameState);
    console.log("World position:", worldContainer.position.z);
    console.log("Distance traveled:", Math.abs(worldContainer.position.z));
    advanceToNextLevel();
    console.log("Game state after advancing:", getGameState());
  }

  // Update game state (score, level, etc.)
  const worldZ = updateGameState(deltaTime, getJumpBonus());

  // Check if we need to loop the world
  if (worldZ <= -ROAD.LENGTH) {
    console.log("=== LOOPING WORLD ===");
    console.log("Previous worldZ:", worldZ);
    setWorldZ(0);
    worldContainer.position.z = 0;
    console.log("Reset worldZ to:", getWorldZ());

    // Update traffic positions when world loops
    updateTrafficPositions();

    // Clean up old collectibles and spawn new ones
    cleanupCollectibles(-ROAD.LENGTH);
    spawnCollectibles(0, ROAD.LENGTH, 20);
  }

  if (collision && !isInvincible()) {
    // Collision detected and not invincible!
    setCrashAnimationActive(true);
    handleCollision(collidedCar);
    handleGameOver();
  }

  // Render the scene
  renderer.render(getScene(), camera);
}

// Start the game when page loads
window.addEventListener("DOMContentLoaded", initGame);
