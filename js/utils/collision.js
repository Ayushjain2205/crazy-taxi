// Collision detection module
import { COLLISION, GAME, ROAD } from "../config/gameConfig.js";
import {
  getTaxi,
  createCrashEffect,
  isJumpActive,
} from "../components/taxi.js";
import { getTrafficCars } from "../components/traffic.js";
import { getWorldContainer } from "../utils/sceneSetup.js";
import { getFinishLine } from "../components/environment.js";
import {
  getCollectibles,
  collectCoin,
  collectPowerUp,
} from "../components/collectibles.js";
import {
  getGreasePatches,
  activateGreaseEffect,
} from "../components/greasePatch.js";
import { addCoins } from "./gameState.js";

let jumpBonus = 0;
let lastFinishLineZ = null;

export function checkCollisions() {
  const taxi = getTaxi();
  const trafficCars = getTrafficCars();
  const worldContainer = getWorldContainer();
  const finishLine = getFinishLine();
  const collectibles = getCollectibles();
  const greasePatches = getGreasePatches();

  // Reset jump bonus at the start of collision detection
  jumpBonus = 0;

  let collision = false;
  let collidedCar = null;
  let finishLineCrossed = false;
  let collectedCoins = 0;
  let timeBonus = 0;
  let hitGrease = false;

  // Check grease patch collisions
  greasePatches.forEach((greasePatch) => {
    const greasePatchRelativeZ =
      greasePatch.position.z + worldContainer.position.z;
    if (
      Math.abs(taxi.position.x - greasePatch.position.x) <
        COLLISION.THRESHOLD_X &&
      Math.abs(greasePatchRelativeZ - taxi.position.z) <
        COLLISION.THRESHOLD_Z &&
      !isJumpActive() // Only affect the taxi if it's not jumping
    ) {
      hitGrease = true;
      activateGreaseEffect();
    }
  });

  // Check collectible collisions
  collectibles.forEach((collectible) => {
    const collectibleRelativeZ =
      collectible.position.z + worldContainer.position.z;
    if (
      Math.abs(taxi.position.x - collectible.position.x) <
        COLLISION.THRESHOLD_X &&
      Math.abs(collectibleRelativeZ - taxi.position.z) < COLLISION.THRESHOLD_Z
    ) {
      if (collectible.userData.isCoin) {
        const points = collectCoin(collectible);
        collectedCoins += points;
        addCoins(1); // Add one coin to the counter
      } else if (collectible.userData.isPowerUp) {
        const timeBonusAmount = collectPowerUp(collectible);
        if (timeBonusAmount) {
          timeBonus += timeBonusAmount;
        }
      }
    }
  });

  // Check if the taxi crossed the finish line
  if (finishLine) {
    // Calculate the relative Z position between the taxi and finish line
    const finishLineRelativeZ =
      finishLine.position.z + worldContainer.position.z;
    const taxiZ = taxi.position.z;
    const distanceToFinish = Math.abs(finishLineRelativeZ - taxiZ);

    // More frequent debug logging
    console.log("Finish line check:");
    console.log("  Distance to finish:", distanceToFinish);
    console.log("  Finish line Z:", finishLine.position.z);
    console.log("  World Z:", worldContainer.position.z);
    console.log("  Relative Z:", finishLineRelativeZ);
    console.log("  Taxi Z:", taxiZ);
    console.log("  Taxi X:", taxi.position.x);

    // More lenient finish line crossing detection
    if (distanceToFinish < 25 && Math.abs(taxi.position.x) < ROAD.WIDTH) {
      console.log("=== FINISH LINE CROSSED! ===");
      console.log("Distance to finish when crossed:", distanceToFinish);
      console.log("Taxi position:", taxi.position.toArray());
      console.log("Finish line position:", finishLine.position.toArray());
      console.log(
        "World container position:",
        worldContainer.position.toArray()
      );
      finishLineCrossed = true;
    }
  }

  // Check collisions with traffic cars
  trafficCars.forEach((car) => {
    // Calculate car's position relative to the taxi
    const carRelativeZ = car.position.z + worldContainer.position.z;

    if (
      Math.abs(taxi.position.x - car.position.x) < COLLISION.THRESHOLD_X &&
      Math.abs(carRelativeZ - taxi.position.z) < COLLISION.THRESHOLD_Z
    ) {
      if (isJumpActive()) {
        jumpBonus += 1; // Award points for jumping over cars
      } else {
        // Collision detected!
        collision = true;
        collidedCar = car;
      }
    }
  });

  return {
    collision,
    collidedCar,
    jumpBonus,
    finishLineCrossed,
    collectedCoins,
    timeBonus,
    hitGrease,
  };
}

export function handleCollision(collidedCar) {
  const worldContainer = getWorldContainer();
  createCrashEffect(collidedCar, worldContainer.position);
}

export function getJumpBonus() {
  return jumpBonus;
}
