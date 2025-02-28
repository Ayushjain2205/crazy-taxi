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
    const finishLineRelativeZ =
      finishLine.position.z + worldContainer.position.z;

    // Print finish line position for debugging (once per second)
    if (
      !lastFinishLineZ ||
      Math.abs(lastFinishLineZ - finishLineRelativeZ) > 10
    ) {
      console.log("Finish line relative Z:", finishLineRelativeZ);
      console.log(
        "Taxi position:",
        taxi.position.x,
        taxi.position.y,
        taxi.position.z
      );
      console.log("World container position:", worldContainer.position.z);
      lastFinishLineZ = finishLineRelativeZ;
    }

    // Much more generous threshold for finish line crossing
    // The Z threshold is 10 units (increased from 5)
    if (
      Math.abs(finishLineRelativeZ) < 10 &&
      Math.abs(taxi.position.x) < ROAD.WIDTH / 2
    ) {
      console.log("FINISH LINE CROSSED! Position:", finishLineRelativeZ);
      finishLineCrossed = true;
    }
  }

  trafficCars.forEach((car) => {
    // Calculate car's position relative to the taxi
    const carRelativeZ = car.position.z + worldContainer.position.z;

    if (
      Math.abs(taxi.position.x - car.position.x) < COLLISION.THRESHOLD_X &&
      Math.abs(carRelativeZ) < COLLISION.THRESHOLD_Z
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
