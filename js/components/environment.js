// Environment elements - road, ground, trees, mountains
import { ROAD, MARKINGS, GRASS, GAME } from "../config/gameConfig.js";
import { getWorldContainer } from "../utils/sceneSetup.js";
import { getCurrentDistanceGoal } from "../utils/gameState.js";

let road;
let finishLine;

export function createEnvironment() {
  const worldContainer = getWorldContainer();

  // Create the road and all environment elements
  road = createRoad(worldContainer);

  // Create finish line
  finishLine = createFinishLine(worldContainer);

  // Create billboards
  createBillboards(worldContainer);
}

function createRoad(worldContainer) {
  const roadGeometry = new THREE.PlaneGeometry(ROAD.WIDTH, ROAD.LENGTH);
  const roadMaterial = new THREE.MeshBasicMaterial({ color: ROAD.COLOR });
  const road = new THREE.Mesh(roadGeometry, roadMaterial);
  road.rotation.x = -Math.PI / 2;

  // Adjust road position to start closer to the taxi
  road.position.z = ROAD.LENGTH / 2 - 100;

  worldContainer.add(road);

  addLaneMarkings(worldContainer);
  createGrass(worldContainer);
  createTrees(worldContainer);
  createMountains(worldContainer);

  return road;
}

function addLaneMarkings(worldContainer) {
  const laneMarkingColor = MARKINGS.COLOR;

  // Center lane divider - using dashed line instead of solid
  const centerLineDashCount = 100;
  const centerLineDashLength = 5;
  const centerLineDashWidth = 0.2;
  const centerLineDashSpacing = 10;
  const centerLineDashGeometry = new THREE.PlaneGeometry(
    centerLineDashWidth,
    centerLineDashLength
  );
  const centerLineDashMaterial = new THREE.MeshBasicMaterial({
    color: laneMarkingColor,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.7,
  });

  // Create center dashed line
  for (let i = 0; i < centerLineDashCount; i++) {
    const zPos = i * (centerLineDashLength + centerLineDashSpacing);
    const centerDash = new THREE.Mesh(
      centerLineDashGeometry,
      centerLineDashMaterial
    );
    centerDash.rotation.x = -Math.PI / 2;
    centerDash.position.set(0, 0.01, zPos);
    worldContainer.add(centerDash);
  }

  // Lane edge markings (side lines)
  const edgeLineGeometry = new THREE.PlaneGeometry(0.15, ROAD.LENGTH);
  const edgeLineMaterial = new THREE.MeshBasicMaterial({
    color: laneMarkingColor,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.7,
  });

  // Left edge line
  const leftEdgeLine = new THREE.Mesh(edgeLineGeometry, edgeLineMaterial);
  leftEdgeLine.rotation.x = -Math.PI / 2;
  leftEdgeLine.position.y = 0.01;
  leftEdgeLine.position.x = -ROAD.WIDTH / 2 + 0.1;
  leftEdgeLine.position.z = ROAD.LENGTH / 2;
  worldContainer.add(leftEdgeLine);

  // Right edge line
  const rightEdgeLine = new THREE.Mesh(edgeLineGeometry, edgeLineMaterial);
  rightEdgeLine.rotation.x = -Math.PI / 2;
  rightEdgeLine.position.y = 0.01;
  rightEdgeLine.position.x = ROAD.WIDTH / 2 - 0.1;
  rightEdgeLine.position.z = ROAD.LENGTH / 2;
  worldContainer.add(rightEdgeLine);

  // Dashed lane markings - much fewer and more subtle
  const dashCount = 80;
  const dashLength = 3;
  const dashWidth = 0.15;
  const dashSpacing = 15;
  const dashGeometry = new THREE.PlaneGeometry(dashWidth, dashLength);
  const dashMaterial = new THREE.MeshBasicMaterial({
    color: laneMarkingColor,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.6,
  });

  // Create dashed lines for each lane
  for (let i = 0; i < dashCount; i++) {
    const zPos = i * (dashLength + dashSpacing);

    // Left lane dashed line
    const leftDash = new THREE.Mesh(dashGeometry, dashMaterial);
    leftDash.rotation.x = -Math.PI / 2;
    leftDash.position.set(-ROAD.WIDTH / 3, 0.01, zPos);
    worldContainer.add(leftDash);

    // Right lane dashed line
    const rightDash = new THREE.Mesh(dashGeometry, dashMaterial);
    rightDash.rotation.x = -Math.PI / 2;
    rightDash.position.set(ROAD.WIDTH / 3, 0.01, zPos);
    worldContainer.add(rightDash);
  }
}

function createGrass(worldContainer) {
  const grassWidth = GRASS.WIDTH;
  const grassGeometry = new THREE.PlaneGeometry(grassWidth, ROAD.LENGTH);
  const grassMaterial = new THREE.MeshBasicMaterial({ color: GRASS.COLOR });

  // Left grass
  const leftGrass = new THREE.Mesh(grassGeometry, grassMaterial);
  leftGrass.rotation.x = -Math.PI / 2;
  leftGrass.position.y = -0.1;
  leftGrass.position.x = -ROAD.WIDTH / 2 - grassWidth / 2;
  leftGrass.position.z = ROAD.LENGTH / 2;
  worldContainer.add(leftGrass);

  // Right grass
  const rightGrass = new THREE.Mesh(grassGeometry, grassMaterial);
  rightGrass.rotation.x = -Math.PI / 2;
  rightGrass.position.y = -0.1;
  rightGrass.position.x = ROAD.WIDTH / 2 + grassWidth / 2;
  rightGrass.position.z = ROAD.LENGTH / 2;
  worldContainer.add(rightGrass);
}

function createTrees(worldContainer) {
  const treeCount = 40;
  const treeSpacing = ROAD.LENGTH / treeCount;

  const createTree = (x, z) => {
    const trunkGeometry = new THREE.CylinderGeometry(0.5, 0.5, 3, 8);
    const trunkMaterial = new THREE.MeshBasicMaterial({ color: 0x8a6642 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 1.5;

    const leavesGeometry = new THREE.ConeGeometry(2.5, 5, 8);
    const leavesMaterial = new THREE.MeshBasicMaterial({ color: 0x3a7d44 });
    const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
    leaves.position.y = 5;

    const tree = new THREE.Group();
    tree.add(trunk);
    tree.add(leaves);
    tree.position.set(x, 0, z);
    worldContainer.add(tree);
  };

  // Create trees on both sides of the road
  for (let i = 0; i < treeCount; i++) {
    const z = i * treeSpacing;

    // Left side tree (with some randomness)
    if (Math.random() > 0.3) {
      // 70% chance to create a tree
      const leftX = -ROAD.WIDTH / 2 - 10 - Math.random() * 10;
      createTree(leftX, z);
    }

    // Right side tree (with some randomness)
    if (Math.random() > 0.3) {
      // 70% chance to create a tree
      const rightX = ROAD.WIDTH / 2 + 10 + Math.random() * 10;
      createTree(rightX, z);
    }
  }
}

function createMountains(worldContainer) {
  const mountainCount = 10;
  const mountainSpacing = ROAD.LENGTH / mountainCount;
  const safeDistanceFromRoad = ROAD.WIDTH / 2 + 30; // Keep mountains at least 30 units away from road edges

  for (let i = 0; i < mountainCount; i++) {
    // Start mountains further along the road (add 500 to starting position)
    const z = 500 + i * mountainSpacing + Math.random() * 100;

    // Randomly choose left or right side of the road
    const side = Math.random() < 0.5 ? -1 : 1;
    // Place mountains only beyond the safe distance from road
    const x = side * (safeDistanceFromRoad + Math.random() * 100);

    const mountainGeometry = new THREE.ConeGeometry(50, 100, 4);
    const mountainMaterial = new THREE.MeshBasicMaterial({ color: 0x7a7a7a });
    const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);
    mountain.position.set(x, 0, z);
    worldContainer.add(mountain);
  }
}

function createFinishLine(worldContainer) {
  // Get the current distance goal from gameState
  let currentDistanceGoal;
  try {
    // Try to get the current goal
    currentDistanceGoal = getCurrentDistanceGoal();
  } catch (e) {
    // Fallback to default if function not available
    currentDistanceGoal = GAME.DISTANCE_GOAL;
    console.log("Using default distance goal:", currentDistanceGoal);
  }

  // Calculate finish line position based on current distance goal
  const finishLinePosition = currentDistanceGoal;
  console.log("Creating finish line at position:", finishLinePosition);

  // Create a checkered finish line
  const finishLineWidth = ROAD.WIDTH + 4; // Wider than the road
  const finishLineDepth = 5;

  // Create the finish line as a group of individual tiles
  const finishLine = new THREE.Group();
  finishLine.position.y = 0.01; // Just above the road to prevent z-fighting
  finishLine.position.z = finishLinePosition;

  // Mark the finish line for collision detection
  finishLine.userData = {
    isFinishLine: true,
    isObstacle: false,
  };

  // Create a grid of black and white tiles
  const tileWidth = 2;
  const numTiles = Math.ceil(finishLineWidth / tileWidth);

  for (let i = 0; i < numTiles; i++) {
    const xPos = i * tileWidth - finishLineWidth / 2 + tileWidth / 2;

    // Alternate black and white tiles
    const tileColor = i % 2 === 0 ? 0xffffff : 0x000000;

    // Create tile geometry
    const tileGeometry = new THREE.PlaneGeometry(tileWidth, finishLineDepth);
    const tileMaterial = new THREE.MeshBasicMaterial({
      color: tileColor,
      side: THREE.DoubleSide,
    });

    const tile = new THREE.Mesh(tileGeometry, tileMaterial);
    tile.rotation.x = -Math.PI / 2;
    tile.position.x = xPos;

    finishLine.add(tile);
  }

  // Add finish line to the world
  worldContainer.add(finishLine);
  console.log(
    "Finish line created and added to world at Z:",
    finishLinePosition
  );

  return finishLine;
}

function createBillboards(worldContainer) {
  const billboardCount = 8;
  const billboardSpacing = ROAD.LENGTH / billboardCount;
  const billboardWidth = 20;
  const billboardHeight = 10;
  const distanceFromRoad = ROAD.WIDTH / 2 + 15; // 15 units from road edge

  // Advertisement messages
  const advertisements = [
    "CRAZY TAXI - Best Ride in Town!",
    "Need Speed? Call Crazy Taxi!",
    "Fast & Safe - That's Crazy Taxi",
    "Download Crazy Taxi App Today!",
    "5-Star Rides Guaranteed",
    "24/7 Taxi Service",
    "Best Rates in Town",
    "Join the Crazy Taxi Family!",
  ];

  for (let i = 0; i < billboardCount; i++) {
    // Start billboards after some distance and space them out
    const z = 200 + i * billboardSpacing;

    // Alternate between left and right sides
    const side = i % 2 === 0 ? -1 : 1;
    const x = side * distanceFromRoad;

    // Create the billboard structure
    const postGeometry = new THREE.CylinderGeometry(0.5, 0.5, 8, 8);
    const postMaterial = new THREE.MeshBasicMaterial({ color: 0x4a4a4a });
    const post = new THREE.Mesh(postGeometry, postMaterial);
    post.position.y = 4; // Half the height

    // Create the sign panel
    const signGeometry = new THREE.PlaneGeometry(
      billboardWidth,
      billboardHeight
    );
    const signMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.FrontSide, // Changed to FrontSide
    });
    const sign = new THREE.Mesh(signGeometry, signMaterial);
    sign.position.y = 9; // Position above post

    // Create text for the billboard
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 256;
    const context = canvas.getContext("2d");

    // Set background
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Add text
    context.fillStyle = "#000000";
    context.font = "bold 48px Arial";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(
      advertisements[i % advertisements.length],
      canvas.width / 2,
      canvas.height / 2
    );

    // Create texture from canvas
    const texture = new THREE.CanvasTexture(canvas);
    sign.material.map = texture;
    sign.material.needsUpdate = true;

    // Group post and sign
    const billboard = new THREE.Group();
    billboard.add(post);
    billboard.add(sign);

    // Position the billboard
    billboard.position.set(x, 0, z);

    // Rotate the sign to face towards the road
    // For left side billboards (negative side), rotate clockwise
    // For right side billboards (positive side), rotate counter-clockwise
    if (side < 0) {
      sign.rotation.y = Math.PI - Math.PI / 6; // Left side
    } else {
      sign.rotation.y = Math.PI / 6; // Right side
    }

    worldContainer.add(billboard);
  }
}

export function getRoad() {
  return road;
}

export function getFinishLine() {
  return finishLine;
}
