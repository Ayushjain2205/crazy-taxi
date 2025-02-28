import { GREASE, LANES, ROAD } from "../config/gameConfig.js";
import { getWorldContainer } from "../utils/sceneSetup.js";

let greasePatchList = [];
let activeGreaseEffect = null;

// Create a grease patch mesh
function createGreasePatchMesh() {
  const geometry = new THREE.PlaneGeometry(GREASE.WIDTH, GREASE.LENGTH);
  const material = new THREE.MeshBasicMaterial({
    color: GREASE.COLOR,
    transparent: true,
    opacity: GREASE.OPACITY,
    side: THREE.DoubleSide,
  });
  const greasePatch = new THREE.Mesh(geometry, material);
  greasePatch.rotation.x = -Math.PI / 2;
  greasePatch.position.y = 0.01; // Slightly above road to prevent z-fighting

  // Add userData for collision detection
  greasePatch.userData.isGreasePatch = true;

  return greasePatch;
}

// Spawn grease patches at regular intervals
export function spawnGreasePatches(startZ, endZ, spacing = 50) {
  const worldContainer = getWorldContainer();

  for (let z = startZ; z < endZ; z += spacing) {
    // Randomly choose lane
    const lane = Math.floor(Math.random() * LANES.COUNT);
    const x = LANES.POSITIONS[lane];

    // Try to spawn a grease patch
    if (Math.random() < GREASE.SPAWN_CHANCE) {
      const greasePatch = createGreasePatchMesh();
      greasePatch.position.set(x, greasePatch.position.y, z);
      worldContainer.add(greasePatch);
      greasePatchList.push(greasePatch);
    }
  }
}

// Update grease patches and effects
export function updateGreasePatches(deltaTime) {
  // Update active grease effect
  if (activeGreaseEffect) {
    activeGreaseEffect.timeLeft -= deltaTime;
    if (activeGreaseEffect.timeLeft <= 0) {
      deactivateGreaseEffect();
    }
  }
}

// Handle grease patch effect
export function activateGreaseEffect() {
  activeGreaseEffect = {
    timeLeft: GREASE.EFFECT_DURATION,
    slowdownFactor: GREASE.SLOWDOWN_FACTOR,
  };
}

function deactivateGreaseEffect() {
  activeGreaseEffect = null;
}

// Clean up grease patches that are too far behind
export function cleanupGreasePatches(minZ) {
  greasePatchList = greasePatchList.filter((patch) => {
    if (patch.position.z < minZ) {
      getWorldContainer().remove(patch);
      return false;
    }
    return true;
  });
}

// Reset all grease patches (for new level or game restart)
export function resetGreasePatches() {
  const worldContainer = getWorldContainer();

  // Remove all existing grease patches
  greasePatchList.forEach((patch) => worldContainer.remove(patch));
  greasePatchList = [];
  activeGreaseEffect = null;

  // Spawn new grease patches
  spawnGreasePatches(100, ROAD.LENGTH, 50);
}

// Get all grease patches for collision detection
export function getGreasePatches() {
  return greasePatchList;
}

// Get current slowdown factor (1.0 means no slowdown)
export function getGreaseSlowdownFactor() {
  return activeGreaseEffect ? activeGreaseEffect.slowdownFactor : 1.0;
}
