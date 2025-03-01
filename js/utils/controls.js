// User input and controls
import { setTaxiLane, getTaxiLane, startJump } from "../components/taxi.js";
import { LANES } from "../config/gameConfig.js";
import { restartGame } from "../utils/gameState.js";
import { getTouchControls, initTouchControls } from "./touchControls.js";

// Input state
const controls = {
  up: false,
  down: false,
  left: false,
  right: false,
  jump: false,
};

function handleKeyDown(e) {
  if (e.repeat) return;

  // Get the current game state
  const gameState = window._getGameState ? window._getGameState() : "playing";

  // Allow only restart key (R) when game is over
  if (gameState === "gameover") {
    if (e.key === "r" || e.key === "R") {
      restartGame();
    }
    return;
  }

  // Don't process movement keys if not playing
  if (gameState !== "playing") return;

  switch (e.key) {
    case "ArrowUp":
      controls.up = true;
      break;
    case "ArrowDown":
      controls.down = true;
      break;
    case "ArrowLeft":
      if (getTaxiLane() > 0) {
        setTaxiLane(getTaxiLane() - 1);
      }
      controls.left = true;
      break;
    case "ArrowRight":
      if (getTaxiLane() < LANES.COUNT - 1) {
        setTaxiLane(getTaxiLane() + 1);
      }
      controls.right = true;
      break;
    case " ": // Spacebar
      controls.jump = true;
      startJump();
      e.preventDefault(); // Prevent page scrolling
      break;
  }
}

function handleKeyUp(e) {
  switch (e.key) {
    case "ArrowUp":
      controls.up = false;
      break;
    case "ArrowDown":
      controls.down = false;
      break;
    case "ArrowLeft":
      controls.left = false;
      break;
    case "ArrowRight":
      controls.right = false;
      break;
    case " ": // Spacebar
      controls.jump = false;
      break;
  }
}

export function setupControls() {
  // Initialize keyboard controls
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);

  // Initialize touch controls
  initTouchControls();
}

export function isPlayerAccelerating() {
  const touchControls = getTouchControls();
  return controls.up || touchControls.up;
}

export function isPlayerDecelerating() {
  const touchControls = getTouchControls();
  return controls.down || touchControls.down;
}

export function isPlayerMovingLeft() {
  const touchControls = getTouchControls();
  return controls.left || touchControls.left;
}

export function isPlayerMovingRight() {
  const touchControls = getTouchControls();
  return controls.right || touchControls.right;
}

export function isPlayerJumping() {
  const touchControls = getTouchControls();
  return controls.jump || touchControls.jump;
}

export function resetControls() {
  controls.up = false;
  controls.down = false;
  controls.left = false;
  controls.right = false;
  controls.jump = false;
}

// Clean up event listeners when no longer needed
export function removeControls() {
  window.removeEventListener("keydown", handleKeyDown);
  window.removeEventListener("keyup", handleKeyUp);
}
