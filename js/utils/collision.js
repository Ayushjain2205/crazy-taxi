// Collision detection module
import { COLLISION } from "../config/gameConfig.js";
import {
  getTaxi,
  createCrashEffect,
  isJumpActive,
} from "../components/taxi.js";
import { getTrafficCars } from "../components/traffic.js";
import { getWorldContainer } from "../utils/sceneSetup.js";

let jumpBonus = 0;

export function checkCollisions() {
  const taxi = getTaxi();
  const trafficCars = getTrafficCars();
  const worldContainer = getWorldContainer();

  // Reset jump bonus at the start of collision detection
  jumpBonus = 0;

  let collision = false;
  let collidedCar = null;

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
  };
}

export function handleCollision(collidedCar) {
  const worldContainer = getWorldContainer();
  createCrashEffect(collidedCar, worldContainer.position);
}

export function getJumpBonus() {
  return jumpBonus;
}
