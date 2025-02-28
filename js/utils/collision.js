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

let jumpBonus = 0;
let lastFinishLineZ = null;

export function checkCollisions() {
  const taxi = getTaxi();
  const trafficCars = getTrafficCars();
  const worldContainer = getWorldContainer();
  const finishLine = getFinishLine();

  // Reset jump bonus at the start of collision detection
  jumpBonus = 0;

  let collision = false;
  let collidedCar = null;
  let finishLineCrossed = false;

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
  };
}

export function handleCollision(collidedCar) {
  const worldContainer = getWorldContainer();
  createCrashEffect(collidedCar, worldContainer.position);
}

export function getJumpBonus() {
  return jumpBonus;
}
