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

    // Print finish line position for debugging (once per second)
    if (
      !lastFinishLineZ ||
      Math.abs(lastFinishLineZ - finishLineRelativeZ) > 10
    ) {
      console.log("Debug - Finish line check:");
      console.log("  Finish line absolute Z:", finishLine.position.z);
      console.log("  World container Z:", worldContainer.position.z);
      console.log("  Finish line relative Z:", finishLineRelativeZ);
      console.log("  Taxi Z:", taxiZ);
      console.log("  Taxi X:", taxi.position.x);
      lastFinishLineZ = finishLineRelativeZ;
    }

    // Improved finish line crossing detection
    // The taxi should be within the road width and close to the finish line Z position
    if (
      Math.abs(finishLineRelativeZ - taxiZ) < 10 &&
      Math.abs(taxi.position.x) < ROAD.WIDTH / 2
    ) {
      console.log("FINISH LINE CROSSED!");
      console.log("  At position:", finishLineRelativeZ);
      console.log("  Taxi position:", taxi.position.toArray());
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
