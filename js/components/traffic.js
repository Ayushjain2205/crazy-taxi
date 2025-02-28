// Traffic module - handles traffic cars
import { TRAFFIC, LANES, ROAD } from "../config/gameConfig.js";
import { getWorldContainer } from "../utils/sceneSetup.js";

const trafficCars = [];

export function createTraffic() {
  // Create initial traffic
  for (let i = 0; i < TRAFFIC.INITIAL_COUNT; i++) {
    createTrafficCar();
  }

  return trafficCars;
}

export function createTrafficCar() {
  const worldContainer = getWorldContainer();

  const car = new THREE.Mesh(
    new THREE.BoxGeometry(2, 1, 4),
    new THREE.MeshBasicMaterial({ color: TRAFFIC.COLOR })
  );

  // Position car ahead in the world
  const lane = Math.floor(Math.random() * LANES.COUNT);
  const z = 50 + Math.random() * ROAD.LENGTH * 0.8; // Spread throughout the road

  car.position.set(LANES.POSITIONS[lane], 0.5, z);
  worldContainer.add(car);
  trafficCars.push(car);

  return car;
}

export function resetTrafficCars() {
  trafficCars.forEach((car) => {
    const lane = Math.floor(Math.random() * LANES.COUNT);
    const z = 50 + Math.random() * ROAD.LENGTH * 0.8;
    car.position.set(LANES.POSITIONS[lane], 0.5, z);
  });
}

export function updateTrafficPositions(worldZ) {
  // If we looped the world, recycle traffic cars
  trafficCars.forEach((car) => {
    // Keep car's relative position but randomize lane and slightly adjust z
    const lane = Math.floor(Math.random() * LANES.COUNT);
    car.position.x = LANES.POSITIONS[lane];
    car.position.z += Math.random() * 100 - 50; // Add some variation

    // Make sure car stays within the road bounds
    if (car.position.z < 50) car.position.z = 50 + Math.random() * 100;
    if (car.position.z > ROAD.LENGTH)
      car.position.z = ROAD.LENGTH - Math.random() * 100;
  });
}

export function getTrafficCars() {
  return trafficCars;
}
