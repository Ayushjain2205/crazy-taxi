// Taxi module - handles the player's taxi and crash effects
import { TAXI, LANES, GAME, EXPLOSION } from "../config/gameConfig.js";
import { getScene } from "../utils/sceneSetup.js";

let taxi;
let taxiParts = [];
let taxiLane = 1; // 0 = left, 1 = middle, 2 = right
let taxiTargetX = LANES.POSITIONS[taxiLane];
let isJumping = false;
let jumpTime = 0;

export function createTaxi() {
  const scene = getScene();

  // Create the taxi (yellow box)
  const taxiGeometry = new THREE.BoxGeometry(
    TAXI.WIDTH,
    TAXI.HEIGHT,
    TAXI.LENGTH
  );
  const taxiMaterial = new THREE.MeshBasicMaterial({ color: TAXI.COLOR });
  taxi = new THREE.Mesh(taxiGeometry, taxiMaterial);

  // Set initial position
  taxi.position.set(
    TAXI.INITIAL_POSITION.x,
    TAXI.INITIAL_POSITION.y,
    TAXI.INITIAL_POSITION.z
  );

  scene.add(taxi);

  // Create taxi parts for crash effect
  createTaxiParts();

  return taxi;
}

function createTaxiParts() {
  const scene = getScene();

  // Clear any existing parts
  taxiParts.forEach((part) => scene.remove(part));
  taxiParts = [];

  // Create 8 smaller cubes to represent broken taxi parts
  const partSize = 1;
  const partGeometry = new THREE.BoxGeometry(partSize, partSize, partSize);
  const partMaterial = new THREE.MeshBasicMaterial({ color: TAXI.COLOR });

  for (let i = 0; i < 8; i++) {
    const part = new THREE.Mesh(partGeometry, partMaterial);
    // Position parts at the taxi position initially
    part.position.copy(taxi.position);
    // Add slight offset for each part
    part.position.x += (Math.random() - 0.5) * 0.5;
    part.position.y += (Math.random() - 0.5) * 0.5;
    part.position.z += (Math.random() - 0.5) * 0.5;

    // Add velocities for the crash animation
    part.userData = {
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        Math.random() * 10,
        (Math.random() - 0.5) * 10
      ),
      rotationSpeed: new THREE.Vector3(
        Math.random() * 0.2,
        Math.random() * 0.2,
        Math.random() * 0.2
      ),
    };

    // Initially hide the parts
    part.visible = false;
    scene.add(part);
    taxiParts.push(part);
  }
}

export function updateTaxi(deltaTime) {
  // Move the taxi smoothly between lanes (X axis only)
  taxi.position.x += (taxiTargetX - taxi.position.x) * 10 * deltaTime;

  // Update jumping
  if (isJumping) {
    jumpTime += deltaTime;
    if (jumpTime > GAME.JUMP_DURATION) {
      isJumping = false;
      jumpTime = 0;
      taxi.position.y = TAXI.DEFAULT_Y;
    } else {
      const fraction = jumpTime / GAME.JUMP_DURATION;
      taxi.position.y =
        TAXI.DEFAULT_Y + GAME.MAX_JUMP_HEIGHT * 4 * fraction * (1 - fraction);
    }
  } else {
    taxi.position.y = TAXI.DEFAULT_Y;
  }
}

export function createCrashEffect(collidedCar, worldContainerPosition) {
  const scene = getScene();

  // Hide the taxi and show its broken parts
  taxi.visible = false;
  taxiParts.forEach((part) => {
    part.visible = true;
  });

  // Create fire particles or explosion effect
  const explosionGeometry = new THREE.SphereGeometry(2, 8, 8);
  const explosionMaterial = new THREE.MeshBasicMaterial({
    color: EXPLOSION.COLOR,
    transparent: true,
    opacity: 0.8,
  });
  const explosion = new THREE.Mesh(explosionGeometry, explosionMaterial);

  // Position explosion between taxi and collided car
  const collisionPoint = new THREE.Vector3();
  collisionPoint.copy(taxi.position);
  collisionPoint.z = collidedCar.position.z + worldContainerPosition.z;

  explosion.position.copy(collisionPoint);
  scene.add(explosion);

  // Animate explosion and remove it after 1 second
  setTimeout(() => {
    scene.remove(explosion);
  }, 1000);
}

export function updateCrashAnimation(deltaTime) {
  // Animate taxi parts flying
  taxiParts.forEach((part) => {
    if (part.visible) {
      // Move part according to velocity
      part.position.x += part.userData.velocity.x * deltaTime;
      part.position.y += part.userData.velocity.y * deltaTime;
      part.position.z += part.userData.velocity.z * deltaTime;

      // Apply gravity
      part.userData.velocity.y -= 9.8 * deltaTime;

      // Rotate part
      part.rotation.x += part.userData.rotationSpeed.x;
      part.rotation.y += part.userData.rotationSpeed.y;
      part.rotation.z += part.userData.rotationSpeed.z;

      // Remove parts that fall below ground
      if (part.position.y < -10) {
        part.visible = false;
      }
    }
  });
}

export function resetTaxi() {
  // Reset taxi position and visibility
  taxi.position.set(
    TAXI.INITIAL_POSITION.x,
    TAXI.INITIAL_POSITION.y,
    TAXI.INITIAL_POSITION.z
  );
  taxi.visible = true;

  // Reset taxi lane
  taxiLane = 1;
  taxiTargetX = LANES.POSITIONS[taxiLane];

  // Reset jump state
  isJumping = false;
  jumpTime = 0;

  // Hide taxi parts
  taxiParts.forEach((part) => {
    part.visible = false;
  });
}

export function getTaxi() {
  return taxi;
}

export function getTaxiParts() {
  return taxiParts;
}

export function getTaxiLane() {
  return taxiLane;
}

export function setTaxiLane(lane) {
  taxiLane = lane;
  taxiTargetX = LANES.POSITIONS[taxiLane];
}

export function startJump() {
  if (!isJumping) {
    isJumping = true;
    jumpTime = 0;
  }
}

export function isJumpActive() {
  return isJumping;
}
