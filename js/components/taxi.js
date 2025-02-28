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

  // Create main taxi group
  taxi = new THREE.Group();

  // Create car body
  const bodyGeometry = new THREE.BoxGeometry(
    TAXI.WIDTH,
    TAXI.HEIGHT,
    TAXI.LENGTH
  );
  const bodyMaterial = new THREE.MeshPhongMaterial({
    color: 0xffd700, // Yellow taxi color
    shininess: 100,
    specular: 0x666666,
  });
  const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
  body.position.y = TAXI.HEIGHT / 2;
  taxi.add(body);

  // Add black stripe detail with checkerboard pattern
  const stripeGeometry = new THREE.BoxGeometry(
    TAXI.WIDTH + 0.05,
    TAXI.HEIGHT / 4,
    TAXI.LENGTH
  );
  const stripeMaterial = new THREE.MeshPhongMaterial({
    color: 0x000000,
    map: createCheckerboardTexture(),
  });
  const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
  stripe.position.y = TAXI.HEIGHT / 2;
  taxi.add(stripe);

  // Add front grill
  const grillGeometry = new THREE.BoxGeometry(
    TAXI.WIDTH * 0.8,
    TAXI.HEIGHT * 0.3,
    0.1
  );
  const grillMaterial = new THREE.MeshPhongMaterial({
    color: 0x111111,
    shininess: 150,
  });
  const grill = new THREE.Mesh(grillGeometry, grillMaterial);
  grill.position.set(0, TAXI.HEIGHT * 0.3, TAXI.LENGTH / 2);
  taxi.add(grill);

  // Add headlights
  const headlightGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.1, 16);
  const headlightMaterial = new THREE.MeshPhongMaterial({
    color: 0xffffff,
    emissive: 0xffff99,
    emissiveIntensity: 0.5,
  });

  const leftHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
  leftHeadlight.rotation.z = Math.PI * 0.5;
  leftHeadlight.position.set(
    -TAXI.WIDTH / 3,
    TAXI.HEIGHT * 0.3,
    TAXI.LENGTH / 2
  );
  taxi.add(leftHeadlight);

  const rightHeadlight = leftHeadlight.clone();
  rightHeadlight.position.x = TAXI.WIDTH / 3;
  taxi.add(rightHeadlight);

  // Add taillights
  const taillightMaterial = new THREE.MeshPhongMaterial({
    color: 0xff0000,
    emissive: 0xff0000,
    emissiveIntensity: 0.5,
  });

  const leftTaillight = new THREE.Mesh(headlightGeometry, taillightMaterial);
  leftTaillight.rotation.z = Math.PI * 0.5;
  leftTaillight.position.set(
    -TAXI.WIDTH / 3,
    TAXI.HEIGHT * 0.3,
    -TAXI.LENGTH / 2
  );
  taxi.add(leftTaillight);

  const rightTaillight = leftTaillight.clone();
  rightTaillight.position.x = TAXI.WIDTH / 3;
  taxi.add(rightTaillight);

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
  const windshieldFrameGeo = new THREE.BoxGeometry(
    TAXI.WIDTH * 0.85,
    TAXI.HEIGHT * 0.55,
    0.05
  );
  const windshieldFrame = new THREE.Mesh(
    windshieldFrameGeo,
    windowFrameMaterial
  );
  windshieldFrame.position.set(0, TAXI.HEIGHT * 0.7, TAXI.LENGTH * 0.3);
  windshieldFrame.rotation.x = Math.PI * 0.1;
  taxi.add(windshieldFrame);

  const windshieldGeometry = new THREE.PlaneGeometry(
    TAXI.WIDTH * 0.8,
    TAXI.HEIGHT * 0.5
  );
  const windshield = new THREE.Mesh(windshieldGeometry, windowMaterial);
  windshield.position.set(0, TAXI.HEIGHT * 0.7, TAXI.LENGTH * 0.3 + 0.01);
  windshield.rotation.x = Math.PI * 0.1;
  taxi.add(windshield);

  // Side windows with frames
  const sideWindowFrameGeo = new THREE.BoxGeometry(
    TAXI.LENGTH * 0.45,
    TAXI.HEIGHT * 0.45,
    0.05
  );
  const leftWindowFrame = new THREE.Mesh(
    sideWindowFrameGeo,
    windowFrameMaterial
  );
  leftWindowFrame.position.set(-TAXI.WIDTH / 2 - 0.02, TAXI.HEIGHT * 0.7, 0);
  leftWindowFrame.rotation.y = Math.PI * 0.5;
  taxi.add(leftWindowFrame);

  const sideWindowGeometry = new THREE.PlaneGeometry(
    TAXI.LENGTH * 0.4,
    TAXI.HEIGHT * 0.4
  );
  const leftWindow = new THREE.Mesh(sideWindowGeometry, windowMaterial);
  leftWindow.position.set(-TAXI.WIDTH / 2 - 0.03, TAXI.HEIGHT * 0.7, 0);
  leftWindow.rotation.y = Math.PI * 0.5;
  taxi.add(leftWindow);

  const rightWindowFrame = leftWindowFrame.clone();
  rightWindowFrame.position.x = TAXI.WIDTH / 2 + 0.02;
  taxi.add(rightWindowFrame);

  const rightWindow = leftWindow.clone();
  rightWindow.position.x = TAXI.WIDTH / 2 + 0.03;
  rightWindow.rotation.y = -Math.PI * 0.5;
  taxi.add(rightWindow);

  // Add wheels with hubcaps
  const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
  const wheelMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
  const hubcapGeometry = new THREE.CylinderGeometry(0.25, 0.25, 0.31, 8);
  const hubcapMaterial = new THREE.MeshPhongMaterial({
    color: 0xcccccc,
    shininess: 150,
  });

  const wheelPositions = [
    [-TAXI.WIDTH / 2 + 0.2, 0.4, -TAXI.LENGTH / 3],
    [TAXI.WIDTH / 2 - 0.2, 0.4, -TAXI.LENGTH / 3],
    [-TAXI.WIDTH / 2 + 0.2, 0.4, TAXI.LENGTH / 3],
    [TAXI.WIDTH / 2 - 0.2, 0.4, TAXI.LENGTH / 3],
  ];

  wheelPositions.forEach((position) => {
    const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel.position.set(...position);
    wheel.rotation.z = Math.PI * 0.5;
    taxi.add(wheel);

    const hubcap = new THREE.Mesh(hubcapGeometry, hubcapMaterial);
    hubcap.position.set(...position);
    hubcap.rotation.z = Math.PI * 0.5;
    taxi.add(hubcap);
  });

  // Add taxi sign on top with "TAXI" text
  const signBaseGeometry = new THREE.BoxGeometry(1, 0.3, 0.6);
  const signBaseMaterial = new THREE.MeshPhongMaterial({
    color: 0x111111, // Dark base color
    shininess: 30,
  });
  const taxiSignBase = new THREE.Mesh(signBaseGeometry, signBaseMaterial);
  taxiSignBase.position.set(0, TAXI.HEIGHT + 0.2, 0);
  taxi.add(taxiSignBase);

  // Add glowing text panels on sides
  const textPanelGeometry = new THREE.PlaneGeometry(0.9, 0.25);
  const textPanelMaterial = new THREE.MeshPhongMaterial({
    color: 0xffff00,
    emissive: 0xffff00,
    emissiveIntensity: 0.8,
    transparent: true,
    opacity: 0.9,
  });

  // Front text panel
  const frontTextPanel = new THREE.Mesh(textPanelGeometry, textPanelMaterial);
  frontTextPanel.position.set(0, TAXI.HEIGHT + 0.2, 0.31);
  taxi.add(frontTextPanel);

  // Back text panel
  const backTextPanel = frontTextPanel.clone();
  backTextPanel.position.z = -0.31;
  backTextPanel.rotation.y = Math.PI;
  taxi.add(backTextPanel);

  // Side text panels
  const sideTextPanelGeometry = new THREE.PlaneGeometry(0.55, 0.25);
  const leftTextPanel = new THREE.Mesh(
    sideTextPanelGeometry,
    textPanelMaterial
  );
  leftTextPanel.position.set(-0.51, TAXI.HEIGHT + 0.2, 0);
  leftTextPanel.rotation.y = Math.PI * 0.5;
  taxi.add(leftTextPanel);

  const rightTextPanel = leftTextPanel.clone();
  rightTextPanel.position.x = 0.51;
  rightTextPanel.rotation.y = -Math.PI * 0.5;
  taxi.add(rightTextPanel);

  // Position the entire taxi
  taxi.position.set(
    TAXI.INITIAL_POSITION.x,
    TAXI.INITIAL_POSITION.y,
    TAXI.INITIAL_POSITION.z
  );

  scene.add(taxi);
  createTaxiParts();
  return taxi;
}

function createTaxiParts() {
  const scene = getScene();

  // Clear any existing parts
  taxiParts.forEach((part) => scene.remove(part));
  taxiParts = [];

  // Create 8 angular parts to match Cybertruck aesthetic
  const partGeometry = new THREE.BoxGeometry(1, 1, 1);
  const partMaterial = new THREE.MeshPhongMaterial({
    color: 0xcccccc,
    shininess: 100,
    specular: 0x666666,
  });

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

  // Update jumping with smoother interpolation
  if (isJumping) {
    jumpTime += deltaTime;
    if (jumpTime > GAME.JUMP_DURATION) {
      isJumping = false;
      jumpTime = 0;
      taxi.position.y = TAXI.DEFAULT_Y;
    } else {
      const fraction = jumpTime / GAME.JUMP_DURATION;
      // Using smoother easing function to prevent flickering
      const smoothFraction = Math.sin(fraction * Math.PI);
      taxi.position.y = TAXI.DEFAULT_Y + GAME.MAX_JUMP_HEIGHT * smoothFraction;
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

// Helper function to create checkerboard texture for the taxi stripe
function createCheckerboardTexture() {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  const squareSize = 8;
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = "#333333";
  for (let x = 0; x < size; x += squareSize * 2) {
    for (let y = 0; y < size; y += squareSize * 2) {
      ctx.fillRect(x, y, squareSize, squareSize);
      ctx.fillRect(x + squareSize, y + squareSize, squareSize, squareSize);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 1);
  return texture;
}
