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

  // Create main car group
  const car = new THREE.Group();

  // Random car color
  const carColors = [
    0xff0000, 0x00ff00, 0x0000ff, 0x800080, 0xffa500, 0x008080,
  ];
  const carColor = carColors[Math.floor(Math.random() * carColors.length)];

  // Create car body
  const bodyGeometry = new THREE.BoxGeometry(2, 1, 4);
  const bodyMaterial = new THREE.MeshPhongMaterial({
    color: carColor,
    shininess: 80,
    specular: 0x666666,
  });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.y = 0.5;
  car.add(body);

  // Add roof
  const roofGeometry = new THREE.BoxGeometry(1.8, 0.7, 2);
  const roofMaterial = new THREE.MeshPhongMaterial({
    color: carColor,
    shininess: 80,
    specular: 0x666666,
  });
  const roof = new THREE.Mesh(roofGeometry, roofMaterial);
  roof.position.set(0, 1.1, 0);
  car.add(roof);

  // Add windows
  const windowMaterial = new THREE.MeshPhongMaterial({
    color: 0x333333,
    transparent: true,
    opacity: 0.7,
  });

  // Windshield
  const windshieldGeometry = new THREE.PlaneGeometry(1.6, 0.7);
  const windshield = new THREE.Mesh(windshieldGeometry, windowMaterial);
  windshield.position.set(0, 1, 1);
  windshield.rotation.x = Math.PI * 0.1;
  car.add(windshield);

  // Back window
  const backWindow = windshield.clone();
  backWindow.position.z = -1;
  backWindow.rotation.x = -Math.PI * 0.1;
  car.add(backWindow);

  // Side windows
  const sideWindowGeometry = new THREE.PlaneGeometry(2, 0.6);
  const leftWindow = new THREE.Mesh(sideWindowGeometry, windowMaterial);
  leftWindow.position.set(-0.91, 1, 0);
  leftWindow.rotation.y = Math.PI * 0.5;
  car.add(leftWindow);

  const rightWindow = leftWindow.clone();
  rightWindow.position.x = 0.91;
  rightWindow.rotation.y = -Math.PI * 0.5;
  car.add(rightWindow);

  // Add wheels
  const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
  const wheelMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });

  const wheelPositions = [
    [-0.8, 0.4, -1.2],
    [0.8, 0.4, -1.2],
    [-0.8, 0.4, 1.2],
    [0.8, 0.4, 1.2],
  ];

  wheelPositions.forEach((position) => {
    const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel.position.set(...position);
    wheel.rotation.z = Math.PI * 0.5;
    car.add(wheel);
  });

  // Position car
  const lane = Math.floor(Math.random() * LANES.COUNT);
  const z = 50 + Math.random() * ROAD.LENGTH * 0.8;
  car.position.set(LANES.POSITIONS[lane], 0, z);

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
