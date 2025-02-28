// Game state management
import { GAME } from "../config/gameConfig.js";
import { resetTaxi } from "../components/taxi.js";
import { resetTrafficCars, createTrafficCar } from "../components/traffic.js";
import { getWorldContainer } from "../utils/sceneSetup.js";
import { getFinishLine } from "../components/environment.js";

// Game state variables
let gameState = "start"; // start, playing, gameover, victory
let level = GAME.INITIAL_LEVEL;
let timeLimit = GAME.TIME_LIMIT;
let remainingTime = timeLimit;
let score = 0;
let coins = 0;
let speed = GAME.INITIAL_SPEED;
let targetSpeed = GAME.INITIAL_SPEED; // Target speed for gradual acceleration
let distance = 0;
let currentDistanceGoal = GAME.DISTANCE_GOAL;
let distanceLeft = currentDistanceGoal;
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
const coinsDiv = document.getElementById("coins");
const speedBoostStatus = document.getElementById("speed-boost");
const invincibilityStatus = document.getElementById("invincibility");

// New function to calculate time limit for a given level
function calculateTimeLimitForLevel(level) {
  const baseTime = GAME.TIME_LIMIT;
  const reduction = (level - 1) * GAME.TIME_DECREASE_PER_LEVEL;
  return Math.max(GAME.MIN_TIME_LIMIT, baseTime - reduction);
}

export function initGameState() {
  // Set up initial state
  gameState = "start";
  level = GAME.INITIAL_LEVEL;
  timeLimit = calculateTimeLimitForLevel(level);
  remainingTime = timeLimit;
  score = 0;
  coins = 0;
  speed = GAME.INITIAL_SPEED;
  targetSpeed = GAME.INITIAL_SPEED;
  distance = 0;
  currentDistanceGoal = GAME.DISTANCE_GOAL;
  distanceLeft = currentDistanceGoal;
  worldZ = 0;

  // Update UI elements
  levelSpan.textContent = level;
  timeLimitSpan.textContent = timeLimit;
  distanceGoalSpan.textContent = currentDistanceGoal;
  scoreDiv.textContent = "Score: " + score;
  timerDiv.textContent = "Time: " + remainingTime;
  speedDiv.textContent = "Speed: 0 km/h";
  distanceLeftDiv.textContent = "Distance: " + distanceLeft + "m left";
  coinsDiv.textContent = "Coins: " + coins;
  speedBoostStatus.textContent = "Speed Boost: OFF";
  speedBoostStatus.classList.remove("active");
  invincibilityStatus.textContent = "Invincibility: OFF";
  invincibilityStatus.classList.remove("active");

  // Set up event listeners
  startButton.addEventListener("click", startButtonClick);
  beginButton.addEventListener("click", beginButtonClick);
  restartButton.addEventListener("click", restartGame);

  // Add global keyboard listeners for buttons
  document.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault(); // Prevent page scroll on spacebar

      // Handle based on game state
      if (gameState === "start" && instructionsDiv.style.display === "flex") {
        startButtonClick();
      } else if (
        gameState === "start" &&
        levelInfoDiv.style.display === "flex"
      ) {
        beginButtonClick();
      } else if (gameState === "gameover") {
        restartGame();
      }
    }
  });

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
  document.getElementById("final-coins").textContent = coins;
  gameOverDiv.style.display = "flex";
}

export function restartGame() {
  // Reset game state
  gameState = "playing";
  level = GAME.INITIAL_LEVEL;
  remainingTime = timeLimit;
  score = 0;
  distance = 0;
  currentDistanceGoal = GAME.DISTANCE_GOAL;
  distanceLeft = currentDistanceGoal;
  speed = GAME.INITIAL_SPEED;
  targetSpeed = GAME.INITIAL_SPEED;
  coins = 0;
  coinsDiv.textContent = "Coins: 0";
  speedBoostStatus.textContent = "Speed Boost: OFF";
  speedBoostStatus.classList.remove("active");
  invincibilityStatus.textContent = "Invincibility: OFF";
  invincibilityStatus.classList.remove("active");

  // Hide finish banner if visible
  finishBanner.style.display = "none";

  // Reset UI
  levelSpan.textContent = level;
  timeLimitSpan.textContent = timeLimit;
  distanceGoalSpan.textContent = currentDistanceGoal;
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

  // Reset finish line position
  const finishLine = getFinishLine();
  if (finishLine) {
    finishLine.position.z = currentDistanceGoal;
    console.log("Reset finish line to position:", currentDistanceGoal);
  }

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
  const distanceThisFrame = speed * deltaTime;
  distance += distanceThisFrame;
  worldZ -= distanceThisFrame;

  // Update distance left using current goal - make sure to use absolute distance
  distanceLeft = Math.max(0, currentDistanceGoal - Math.abs(worldZ));

  // Update score
  score = Math.floor(distance) + jumpBonus;

  // Update UI
  scoreDiv.textContent = "Score: " + score;
  speedDiv.textContent = "Speed: " + Math.floor(speed) + " km/h";
  distanceLeftDiv.textContent =
    "Distance: " + Math.floor(distanceLeft) + "m left";

  // Log current position and distance for debugging
  if (Math.floor(Math.abs(worldZ)) % 100 === 0) {
    console.log("Current worldZ:", worldZ);
    console.log("Current distance:", Math.abs(worldZ));
    console.log("Distance left:", distanceLeft);
    console.log("Current goal:", currentDistanceGoal);
  }

  return worldZ;
}

export function handleVictory() {
  // This function is kept for compatibility but is no longer used
  // We now use advanceToNextLevel when crossing the finish line

  // Legacy victory code:
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
  // This function is deprecated and should not be used directly
  // Use advanceToNextLevel() instead which properly handles the finish line
  console.warn(
    "advanceLevel() is deprecated, use advanceToNextLevel() instead"
  );

  level += 1;
  remainingTime += 30;
  timerDiv.textContent = "Time: " + remainingTime;

  // Add more traffic cars
  for (let i = 0; i < 3; i++) {
    createTrafficCar();
  }
}

// New function to handle finish line crossing
export function advanceToNextLevel() {
  console.log("=== ADVANCING TO NEXT LEVEL ===");
  console.log("Current level:", level);

  // Increase level
  level += 1;
  console.log("New level:", level);

  // Calculate new time limit for this level
  timeLimit = calculateTimeLimitForLevel(level);
  remainingTime = timeLimit;
  console.log("New time limit:", timeLimit);

  // Keep the current score and maintain constant distance goal
  currentDistanceGoal = GAME.DISTANCE_GOAL; // Keep distance constant at 1000m
  distanceLeft = currentDistanceGoal;

  // Reset world position to the start
  const worldContainer = getWorldContainer();
  worldContainer.position.z = 0;
  worldZ = 0;

  // Move finish line to new position
  const finishLine = getFinishLine();
  if (finishLine) {
    finishLine.position.z = currentDistanceGoal;
    console.log("Moved finish line to new position:", currentDistanceGoal);
  }

  // Add more traffic and increase difficulty
  for (let i = 0; i < Math.min(level + 2, 8); i++) {
    createTrafficCar();
  }

  // Add level completion bonus
  const levelBonus = level * 1000; // 1000 points per level completed
  score += levelBonus;

  // Update UI
  levelSpan.textContent = level;
  timerDiv.textContent = "Time: " + remainingTime;
  distanceLeftDiv.textContent =
    "Distance: " + Math.floor(distanceLeft) + "m left";
  distanceGoalSpan.textContent = currentDistanceGoal;
  scoreDiv.textContent = "Score: " + score;

  // Show level up notification with time limit info and bonus points
  const levelUpDiv = document.createElement("div");
  levelUpDiv.className = "level-up-notification";
  levelUpDiv.innerHTML = `
    <h2>LEVEL ${level} COMPLETE!</h2>
    <p>Level Bonus: +${levelBonus} points</p>
    <p>Next Goal: ${currentDistanceGoal}m</p>
    <p>Time Limit: ${timeLimit}s</p>
    <p>Difficulty: ${level > 1 ? "⚠️ Less time to reach the goal!" : ""}</p>
  `;
  document.body.appendChild(levelUpDiv);

  // Remove the notification after 3 seconds
  setTimeout(() => {
    document.body.removeChild(levelUpDiv);
  }, 3000);

  console.log("Level up complete - Score:", score);
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

export function getCurrentDistanceGoal() {
  return currentDistanceGoal;
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

export function addScore(points) {
  score += points;
  scoreDiv.textContent = "Score: " + score;
}

export function addCoins(amount) {
  coins += amount;
  coinsDiv.textContent = "Coins: " + coins;
}

export function addTimeBonus(seconds = 2) {
  // Default to 2 seconds
  remainingTime += 2; // Always add 2 seconds
  timerDiv.textContent = "⏱️ Time: " + remainingTime;

  // Show time bonus popup
  const popup = document.createElement("div");
  popup.className = "time-bonus-popup";
  popup.innerHTML = `+2s`; // Simpler format
  document.body.appendChild(popup);

  // Remove popup after animation
  setTimeout(() => {
    document.body.removeChild(popup);
  }, 1000);
}

export function updatePowerUpStatus(type, active, timeLeft = 0) {
  switch (type) {
    case "SPEED_BOOST":
      speedBoostStatus.innerHTML = active
        ? `🚀 Speed Boost (${Math.ceil(timeLeft)}s)`
        : "🚀 Speed Boost";
      speedBoostStatus.classList.toggle("active", active);
      break;
    case "INVINCIBILITY":
      invincibilityStatus.innerHTML = active
        ? `⭐ Invincibility (${Math.ceil(timeLeft)}s)`
        : "⭐ Invincibility";
      invincibilityStatus.classList.toggle("active", active);
      break;
  }
}
