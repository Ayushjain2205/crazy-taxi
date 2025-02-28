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

  // Random car color with metallic colors
  const carColors = [
    0xcc0000, // Deep Red
    0x0066cc, // Royal Blue
    0x009933, // Forest Green
    0x663399, // Purple
    0xff6600, // Orange
    0x666666, // Silver
  ];
  const carColor = carColors[Math.floor(Math.random() * carColors.length)];

  // Create car body with modern design
  const bodyGeometry = new THREE.BoxGeometry(2, 1.2, 4);
  const bodyMaterial = new THREE.MeshPhongMaterial({
    color: carColor,
    shininess: 100,
    specular: 0x666666,
  });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.y = 0.6;
  car.add(body);

  // Add sleek roof
  const roofGeometry = new THREE.BoxGeometry(1.8, 0.6, 2.2);
  const roofMaterial = new THREE.MeshPhongMaterial({
    color: carColor,
    shininess: 100,
    specular: 0x666666,
  });
  const roof = new THREE.Mesh(roofGeometry, roofMaterial);
  roof.position.set(0, 1.4, -0.2);
  car.add(roof);

  // Add front grill
  const grillGeometry = new THREE.BoxGeometry(1.6, 0.4, 0.1);
  const grillMaterial = new THREE.MeshPhongMaterial({
    color: 0x111111,
    shininess: 150,
  });
  const grill = new THREE.Mesh(grillGeometry, grillMaterial);
  grill.position.set(0, 0.5, 2);
  car.add(grill);

  // Add headlights
  const headlightGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.1, 16);
  const headlightMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    emissive: 0xffffcc,
    emissiveIntensity: 0.5,
  });

  const leftHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
  leftHeadlight.rotation.z = Math.PI * 0.5;
  leftHeadlight.position.set(-0.6, 0.5, 2);
  car.add(leftHeadlight);

  const rightHeadlight = leftHeadlight.clone();
  rightHeadlight.position.x = 0.6;
  car.add(rightHeadlight);

  // Add taillights
  const taillightMaterial = new THREE.MeshPhongMaterial({
    color: 0xff0000,
    emissive: 0xff0000,
    emissiveIntensity: 0.5,
  });

  const leftTaillight = new THREE.Mesh(headlightGeometry, taillightMaterial);
  leftTaillight.rotation.z = Math.PI * 0.5;
  leftTaillight.position.set(-0.6, 0.5, -2);
  car.add(leftTaillight);

  const rightTaillight = leftTaillight.clone();
  rightTaillight.position.x = 0.6;
  car.add(rightTaillight);

  // Add windows with frames
  const windowMaterial = new THREE.MeshPhongMaterial({
    color: 0x333333,
    transparent: true,
    opacity: 0.7,
  });

  const windowFrameMaterial = new THREE.MeshPhongMaterial({
    color: 0x111111,
  });

  // Windshield with frame
  const windshieldFrameGeo = new THREE.BoxGeometry(1.7, 0.8, 0.05);
  const windshieldFrame = new THREE.Mesh(
    windshieldFrameGeo,
    windowFrameMaterial
  );
  windshieldFrame.position.set(0, 1.2, 1);
  windshieldFrame.rotation.x = Math.PI * 0.1;
  car.add(windshieldFrame);

  const windshieldGeometry = new THREE.PlaneGeometry(1.6, 0.7);
  const windshield = new THREE.Mesh(windshieldGeometry, windowMaterial);
  windshield.position.set(0, 1.2, 1.01);
  windshield.rotation.x = Math.PI * 0.1;
  car.add(windshield);

  // Back window
  const backWindowFrame = windshieldFrame.clone();
  backWindowFrame.position.z = -1.4;
  backWindowFrame.rotation.x = -Math.PI * 0.1;
  car.add(backWindowFrame);

  const backWindow = windshield.clone();
  backWindow.position.z = -1.41;
  backWindow.rotation.x = -Math.PI * 0.1;
  car.add(backWindow);

  // Side windows
  const sideWindowGeometry = new THREE.PlaneGeometry(2, 0.6);
  const leftWindow = new THREE.Mesh(sideWindowGeometry, windowMaterial);
  leftWindow.position.set(-1.01, 1.2, -0.2);
  leftWindow.rotation.y = Math.PI * 0.5;
  car.add(leftWindow);

  const rightWindow = leftWindow.clone();
  rightWindow.position.x = 1.01;
  rightWindow.rotation.y = -Math.PI * 0.5;
  car.add(rightWindow);

  // Add wheels with hubcaps
  const wheelGeometry = new THREE.CylinderGeometry(0.35, 0.35, 0.3, 16);
  const wheelMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
  const hubcapGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.31, 8);
  const hubcapMaterial = new THREE.MeshPhongMaterial({
    color: 0xcccccc,
    shininess: 150,
  });

  const wheelPositions = [
    [-0.9, 0.35, -1.5],
    [0.9, 0.35, -1.5],
    [-0.9, 0.35, 1.5],
    [0.9, 0.35, 1.5],
  ];

  wheelPositions.forEach((position) => {
    const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel.position.set(...position);
    wheel.rotation.z = Math.PI * 0.5;
    car.add(wheel);

    const hubcap = new THREE.Mesh(hubcapGeometry, hubcapMaterial);
    hubcap.position.set(...position);
    hubcap.rotation.z = Math.PI * 0.5;
    car.add(hubcap);
  });

  // Position car
  const lane = Math.floor(Math.random() * LANES.COUNT);
  // Distribute cars more evenly along the first portion of the road
  const z = 100 + Math.random() * ROAD.LENGTH * 0.4;
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
