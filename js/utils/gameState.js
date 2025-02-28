// Game state management
import { GAME } from "../config/gameConfig.js";
import { resetTaxi } from "../components/taxi.js";
import { resetTrafficCars, createTrafficCar } from "../components/traffic.js";
import { getWorldContainer } from "../utils/sceneSetup.js";

// Game state variables
let gameState = "start"; // start, playing, gameover, victory
let level = GAME.INITIAL_LEVEL;
let timeLimit = GAME.TIME_LIMIT;
let remainingTime = timeLimit;
let score = 0;
let speed = GAME.INITIAL_SPEED;
let targetSpeed = GAME.INITIAL_SPEED; // Target speed for gradual acceleration
let distance = 0;
let distanceLeft = GAME.DISTANCE_GOAL;
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
const distanceGoalSpan = document.getElementById("distance-goal");
const scoreDiv = document.getElementById("score");
const timerDiv = document.getElementById("timer");
const speedDiv = document.getElementById("speed");
const distanceLeftDiv = document.getElementById("distance-left");
const finalScoreSpan = document.getElementById("final-score");
const finishBanner = document.getElementById("finish-banner");

export function initGameState() {
  // Set up initial state
  gameState = "start";
  level = GAME.INITIAL_LEVEL;
  timeLimit = GAME.TIME_LIMIT;
  remainingTime = timeLimit;
  score = 0;
  speed = GAME.INITIAL_SPEED;
  targetSpeed = GAME.INITIAL_SPEED;
  distance = 0;
  distanceLeft = GAME.DISTANCE_GOAL;
  worldZ = 0;

  // Update UI elements
  levelSpan.textContent = level;
  timeLimitSpan.textContent = timeLimit;
  distanceGoalSpan.textContent = GAME.DISTANCE_GOAL;
  scoreDiv.textContent = "Score: " + score;
  timerDiv.textContent = "Time: " + remainingTime;
  speedDiv.textContent = "Speed: 0 km/h";
  distanceLeftDiv.textContent = "Distance: " + distanceLeft + "m left";

  // Set up event listeners
  startButton.addEventListener("click", startButtonClick);
  beginButton.addEventListener("click", beginButtonClick);
  restartButton.addEventListener("click", restartGame);

  // Show instructions
  instructionsDiv.style.display = "flex";
  levelInfoDiv.style.display = "none";
  gameOverDiv.style.display = "none";

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

  // Show game over screen with crash message
  gameOverDiv.querySelector("h1").textContent = "CRASH!";
  gameOverDiv.querySelector("h2").textContent = "Game Over";
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
  distanceLeft = GAME.DISTANCE_GOAL;
  speed = GAME.INITIAL_SPEED;
  targetSpeed = GAME.INITIAL_SPEED;

  // Hide finish banner if visible
  finishBanner.style.display = "none";

  // Reset UI
  levelSpan.textContent = level;
  timeLimitSpan.textContent = timeLimit;
  distanceGoalSpan.textContent = GAME.DISTANCE_GOAL;
  scoreDiv.textContent = "Score: 0";
  timerDiv.textContent = "Time: " + remainingTime;
  speedDiv.textContent = "Speed: 0 km/h";
  distanceLeftDiv.textContent = "Distance: " + distanceLeft + "m left";
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

  // Update distance left
  distanceLeft = Math.max(0, GAME.DISTANCE_GOAL - distance);

  // Update score
  score = Math.floor(distance) + jumpBonus;

  // Update UI
  scoreDiv.textContent = "Score: " + score;
  speedDiv.textContent = "Speed: " + Math.floor(speed) + " km/h";
  distanceLeftDiv.textContent =
    "Distance: " + Math.floor(distanceLeft) + "m left";

  // Don't trigger victory based on distance anymore
  // Let the finish line crossing handle it instead

  // Check for level advancement
  if (distance >= 1000 * level) {
    advanceLevel();
  }

  return worldZ;
}

export function handleVictory() {
  gameState = "victory";
  clearInterval(timerInterval);

  // Show finish banner with animation
  finishBanner.style.display = "block";

  // Animate banner
  setTimeout(() => {
    // After 3 seconds, hide banner and show victory screen
    finishBanner.style.display = "none";

    // Show game over screen with victory message
    gameOverDiv.querySelector("h1").textContent = "SUCCESS!";
    gameOverDiv.querySelector("h2").textContent =
      "You reached the finish line!";
    finalScoreSpan.textContent = score;
    gameOverDiv.style.display = "flex";
  }, 3000);
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
  return gameState; // start, playing, gameover, victory
}

export function setGameState(state) {
  gameState = state;
}

export function getSpeed() {
  return speed;
}

export function updateSpeed(deltaTime, isAccelerating, isDecelerating) {
  if (isAccelerating) {
    // Set target speed based on acceleration
    targetSpeed += 30 * deltaTime;
    if (targetSpeed > GAME.MAX_SPEED) targetSpeed = GAME.MAX_SPEED;
  } else if (isDecelerating) {
    // Set target speed based on deceleration
    targetSpeed -= 30 * deltaTime;
    if (targetSpeed < GAME.MIN_SPEED) targetSpeed = GAME.MIN_SPEED;
  }

  // Gradually adjust actual speed towards target speed
  if (speed < targetSpeed) {
    speed += 15 * deltaTime; // Accelerate more gradually
    if (speed > targetSpeed) speed = targetSpeed;
  } else if (speed > targetSpeed) {
    speed -= 25 * deltaTime; // Decelerate a bit faster
    if (speed < targetSpeed) speed = targetSpeed;
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
