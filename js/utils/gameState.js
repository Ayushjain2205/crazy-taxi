// Game state management
import { GAME } from "../config/gameConfig.js";
import { resetTaxi } from "../components/taxi.js";
import { resetTrafficCars, createTrafficCar } from "../components/traffic.js";
import { getWorldContainer } from "../utils/sceneSetup.js";

// Game state variables
let gameState = "start"; // start, playing, gameover
let level = GAME.INITIAL_LEVEL;
let timeLimit = GAME.TIME_LIMIT;
let remainingTime = timeLimit;
let score = 0;
let speed = GAME.INITIAL_SPEED;
let distance = 0;
let worldZ = 0;
let timerInterval;
let gameOverAnimationTime = 0;
let crashAnimationActive = false;

// UI elements
const instructionsDiv = document.getElementById("instructions");
const levelInfoDiv = document.getElementById("level-info");
const gameOverDiv = document.getElementById("game-over");
const startButton = document.getElementById("start-button");
const beginButton = document.getElementById("begin-button");
const restartButton = document.getElementById("restart-button");
const levelSpan = document.getElementById("level");
const timeLimitSpan = document.getElementById("time-limit");
const scoreDiv = document.getElementById("score");
const timerDiv = document.getElementById("timer");
const finalScoreSpan = document.getElementById("final-score");

export function initGameState() {
  // Set initial UI values
  levelSpan.textContent = level;
  timeLimitSpan.textContent = timeLimit;
  timerDiv.textContent = "Time: " + remainingTime;

  // Make sure level info is initially hidden
  levelInfoDiv.style.display = "none";
  gameOverDiv.style.display = "none";

  // Handle start button clicks
  startButton.addEventListener("click", startButtonClick);
  beginButton.addEventListener("click", beginButtonClick);
  restartButton.addEventListener("click", restartGame);

  // Export the game state to window for access by controls
  window._getGameState = getGameState;
}

function startButtonClick() {
  instructionsDiv.style.display = "none";
  levelInfoDiv.style.display = "flex";
}

function beginButtonClick() {
  levelInfoDiv.style.display = "none";
  gameState = "playing";
  timerInterval = setInterval(() => {
    remainingTime--;
    timerDiv.textContent = "Time: " + remainingTime;
    if (remainingTime <= 0) {
      handleGameOver();
    }
  }, 1000);
}

export function handleGameOver() {
  gameState = "gameover";
  clearInterval(timerInterval);

  // Show game over screen
  finalScoreSpan.textContent = score;
  gameOverDiv.style.display = "flex";
}

export function restartGame() {
  // Reset game state
  gameState = "playing";
  level = GAME.INITIAL_LEVEL;
  remainingTime = timeLimit;
  score = 0;
  distance = 0;
  speed = GAME.INITIAL_SPEED;

  // Reset UI
  levelSpan.textContent = level;
  timeLimitSpan.textContent = timeLimit;
  timerDiv.textContent = "Time: " + remainingTime;
  scoreDiv.textContent = "Score: 0";
  gameOverDiv.style.display = "none";

  // Reset taxi
  resetTaxi();

  // Reset world position
  const worldContainer = getWorldContainer();
  worldContainer.position.z = 0;
  worldZ = 0;

  // Reset traffic cars
  resetTrafficCars();

  // Reset animation flags
  crashAnimationActive = false;
  gameOverAnimationTime = 0;

  // Restart timer
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    remainingTime--;
    timerDiv.textContent = "Time: " + remainingTime;
    if (remainingTime <= 0) {
      handleGameOver();
    }
  }, 1000);
}

export function updateGameState(deltaTime, jumpBonus) {
  if (gameState !== "playing") return;

  // Update world position and distance
  distance += speed * deltaTime;
  worldZ -= speed * deltaTime;

  // Update score
  score = Math.floor(distance) + jumpBonus;
  scoreDiv.textContent = "Score: " + score;

  // Check for level advancement
  if (distance >= 1000 * level) {
    advanceLevel();
  }

  return worldZ;
}

function advanceLevel() {
  level += 1;
  remainingTime += 30;
  timerDiv.textContent = "Time: " + remainingTime;

  // Add more traffic cars
  for (let i = 0; i < 3; i++) {
    createTrafficCar();
  }
}

export function getGameState() {
  return gameState;
}

export function setGameState(state) {
  gameState = state;
}

export function getSpeed() {
  return speed;
}

export function updateSpeed(deltaTime, isAccelerating, isDecelerating) {
  if (isAccelerating) {
    speed += 20 * deltaTime;
    if (speed > GAME.MAX_SPEED) speed = GAME.MAX_SPEED;
  } else if (isDecelerating) {
    speed -= 20 * deltaTime;
    if (speed < GAME.MIN_SPEED) speed = GAME.MIN_SPEED;
  }
}

export function getWorldZ() {
  return worldZ;
}

export function setWorldZ(value) {
  worldZ = value;
}

export function setCrashAnimationActive(active) {
  crashAnimationActive = active;
}

export function isCrashAnimationActive() {
  return crashAnimationActive;
}

export function getGameOverAnimationTime() {
  return gameOverAnimationTime;
}

export function updateGameOverAnimationTime(deltaTime) {
  gameOverAnimationTime += deltaTime;
}
