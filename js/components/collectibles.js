import { COINS, POWERUPS, LANES, ROAD } from "../config/gameConfig.js";
import { getWorldContainer } from "../utils/sceneSetup.js";
import { updatePowerUpStatus } from "../utils/gameState.js";

let coins = [];
let powerUps = [];
let activeSpeedBoost = null;
let activeInvincibility = null;

// Create a coin mesh
function createCoinMesh() {
  const geometry = new THREE.CylinderGeometry(
    COINS.RADIUS,
    COINS.RADIUS,
    COINS.HEIGHT,
    32
  );
  const material = new THREE.MeshPhongMaterial({
    color: COINS.COLOR,
    shininess: 100,
    specular: 0xffffff,
  });
  const coin = new THREE.Mesh(geometry, material);
  coin.rotation.x = Math.PI / 2; // Make coin face up
  return coin;
}

// Create a power-up mesh
function createPowerUpMesh(type) {
  const config = POWERUPS.TYPES[type];
  const geometry = new THREE.OctahedronGeometry(POWERUPS.RADIUS);
  const material = new THREE.MeshPhongMaterial({
    color: config.COLOR,
    shininess: 100,
    specular: 0xffffff,
    transparent: true,
    opacity: 0.8,
  });
  const powerUp = new THREE.Mesh(geometry, material);
  powerUp.scale.setScalar(config.MODEL_SCALE);
  powerUp.userData.type = type;
  return powerUp;
}

// Spawn collectibles at regular intervals
export function spawnCollectibles(startZ, endZ, spacing = 20) {
  const worldContainer = getWorldContainer();

  for (let z = startZ; z < endZ; z += spacing) {
    // Randomly choose lane
    const lane = Math.floor(Math.random() * LANES.COUNT);
    const x = LANES.POSITIONS[lane];

    // Try to spawn a coin
    if (Math.random() < COINS.SPAWN_CHANCE) {
      const coin = createCoinMesh();
      coin.position.set(x, 1, z);
      coin.userData.isCollectible = true;
      coin.userData.isCoin = true;
      worldContainer.add(coin);
      coins.push(coin);
    }

    // Try to spawn a power-up
    if (Math.random() < POWERUPS.SPAWN_CHANCE) {
      const types = Object.keys(POWERUPS.TYPES);
      const type = types[Math.floor(Math.random() * types.length)];
      const powerUp = createPowerUpMesh(type);
      // Place power-ups in a different lane than coins
      const powerUpLane = (lane + 1) % LANES.COUNT;
      powerUp.position.set(LANES.POSITIONS[powerUpLane], 1.5, z + spacing / 2);
      powerUp.userData.isCollectible = true;
      powerUp.userData.isPowerUp = true;
      worldContainer.add(powerUp);
      powerUps.push(powerUp);
    }
  }
}

// Update collectibles (rotation, hover effect)
export function updateCollectibles(deltaTime) {
  const time = performance.now() / 1000;

  // Update coins
  coins.forEach((coin) => {
    if (coin.visible) {
      coin.rotation.z += COINS.ROTATION_SPEED * deltaTime;
      coin.position.y =
        1 + Math.sin(time * COINS.HOVER_SPEED) * COINS.HOVER_AMPLITUDE;
    }
  });

  // Update power-ups
  powerUps.forEach((powerUp) => {
    if (powerUp.visible) {
      powerUp.rotation.y += POWERUPS.ROTATION_SPEED * deltaTime;
      powerUp.rotation.x += POWERUPS.ROTATION_SPEED * deltaTime * 0.5;
      powerUp.position.y =
        1.5 + Math.sin(time * POWERUPS.HOVER_SPEED) * POWERUPS.HOVER_AMPLITUDE;
    }
  });

  // Update active power-ups
  if (activeSpeedBoost) {
    activeSpeedBoost.timeLeft -= deltaTime;
    updatePowerUpStatus("SPEED_BOOST", true, activeSpeedBoost.timeLeft);
    if (activeSpeedBoost.timeLeft <= 0) {
      deactivateSpeedBoost();
    }
  }

  if (activeInvincibility) {
    activeInvincibility.timeLeft -= deltaTime;
    updatePowerUpStatus("INVINCIBILITY", true, activeInvincibility.timeLeft);
    if (activeInvincibility.timeLeft <= 0) {
      deactivateInvincibility();
    }
  }
}

// Handle coin collection
export function collectCoin(coin) {
  if (!coin.visible) return 0;
  coin.visible = false;
  return COINS.POINTS;
}

// Handle power-up collection
export function collectPowerUp(powerUp) {
  if (!powerUp.visible) return;
  powerUp.visible = false;

  const type = powerUp.userData.type;
  switch (type) {
    case "SPEED_BOOST":
      activateSpeedBoost();
      break;
    case "TIME_BONUS":
      return POWERUPS.TYPES.TIME_BONUS.TIME_ADDED;
    case "INVINCIBILITY":
      activateInvincibility();
      break;
  }
}

// Power-up effects
function activateSpeedBoost() {
  activeSpeedBoost = {
    timeLeft: POWERUPS.TYPES.SPEED_BOOST.DURATION,
    multiplier: POWERUPS.TYPES.SPEED_BOOST.MULTIPLIER,
  };
}

function deactivateSpeedBoost() {
  activeSpeedBoost = null;
  updatePowerUpStatus("SPEED_BOOST", false);
}

function activateInvincibility() {
  activeInvincibility = {
    timeLeft: POWERUPS.TYPES.INVINCIBILITY.DURATION,
  };
}

function deactivateInvincibility() {
  activeInvincibility = null;
  updatePowerUpStatus("INVINCIBILITY", false);
}

// Getters for power-up states
export function getSpeedBoostMultiplier() {
  return activeSpeedBoost ? activeSpeedBoost.multiplier : 1;
}

export function isInvincible() {
  return activeInvincibility !== null;
}

// Clean up collectibles that are too far behind
export function cleanupCollectibles(minZ) {
  coins = coins.filter((coin) => {
    if (coin.position.z < minZ) {
      getWorldContainer().remove(coin);
      return false;
    }
    return true;
  });

  powerUps = powerUps.filter((powerUp) => {
    if (powerUp.position.z < minZ) {
      getWorldContainer().remove(powerUp);
      return false;
    }
    return true;
  });
}

// Reset all collectibles (for new level or game restart)
export function resetCollectibles() {
  const worldContainer = getWorldContainer();

  // Remove all existing collectibles
  coins.forEach((coin) => worldContainer.remove(coin));
  powerUps.forEach((powerUp) => worldContainer.remove(powerUp));

  coins = [];
  powerUps = [];
  activeSpeedBoost = null;
  activeInvincibility = null;

  // Spawn new collectibles
  spawnCollectibles(100, ROAD.LENGTH, 20);
}

// Get all active collectibles for collision detection
export function getCollectibles() {
  return [...coins, ...powerUps].filter((item) => item.visible);
}
