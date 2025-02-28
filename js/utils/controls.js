// User input and controls
import { setTaxiLane, getTaxiLane, startJump } from "../components/taxi.js";
import { LANES } from "../config/gameConfig.js";
import { restartGame } from "../utils/gameState.js";

// Input state
let isAccelerating = false;
let isDecelerating = false;

export function setupControls() {
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
}

function handleKeyDown(e) {
  if (e.repeat) return;

  // Get the current game state from the exported function
  const gameState = window._getGameState ? window._getGameState() : "playing";

  // Allow only restart key (R) when game is over
  if (gameState === "gameover") {
    if (e.key === "r" || e.key === "R") {
      restartGame();
    }
    return;
  }

  if (gameState !== "playing") return;

  const taxiLane = getTaxiLane();

  if (e.key === "ArrowLeft" && taxiLane > 0) {
    setTaxiLane(taxiLane - 1);
  } else if (e.key === "ArrowRight" && taxiLane < LANES.COUNT - 1) {
    setTaxiLane(taxiLane + 1);
  } else if (e.key === "ArrowUp") {
    isAccelerating = true;
  } else if (e.key === "ArrowDown") {
    isDecelerating = true;
  } else if (e.key === " " || e.code === "Space") {
    startJump();
  }
}

function handleKeyUp(e) {
  if (e.key === "ArrowUp") {
    isAccelerating = false;
  } else if (e.key === "ArrowDown") {
    isDecelerating = false;
  }
}

export function isPlayerAccelerating() {
  return isAccelerating;
}

export function isPlayerDecelerating() {
  return isDecelerating;
}

// Clean up event listeners when no longer needed
export function removeControls() {
  window.removeEventListener("keydown", handleKeyDown);
  window.removeEventListener("keyup", handleKeyUp);
}
