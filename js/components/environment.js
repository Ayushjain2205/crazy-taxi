// Environment elements - road, ground, trees, mountains
import { ROAD, MARKINGS, GRASS } from "../config/gameConfig.js";
import { getWorldContainer } from "../utils/sceneSetup.js";

let road;

export function createEnvironment() {
  const worldContainer = getWorldContainer();

  // Create the road
  createRoad(worldContainer);

  // Add lane markings
  addLaneMarkings(worldContainer);

  // Create grass on both sides of the road
  createGrass(worldContainer);

  // Create trees along the road
  createTrees(worldContainer);

  // Create mountains in the background
  createMountains(worldContainer);
}

function createRoad(worldContainer) {
  const roadGeometry = new THREE.PlaneGeometry(ROAD.WIDTH, ROAD.LENGTH);
  const roadMaterial = new THREE.MeshBasicMaterial({ color: ROAD.COLOR });

  road = new THREE.Mesh(roadGeometry, roadMaterial);
  road.rotation.x = -Math.PI / 2;
  road.position.y = 0;
  road.position.z = ROAD.LENGTH / 2; // Position road ahead

  worldContainer.add(road);
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

  for (let i = 0; i < mountainCount; i++) {
    const z = i * mountainSpacing + Math.random() * 100;
    const x = (Math.random() - 0.5) * 300;

    const mountainGeometry = new THREE.ConeGeometry(50, 100, 4);
    const mountainMaterial = new THREE.MeshBasicMaterial({ color: 0x7a7a7a });
    const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);
    mountain.position.set(x, 0, z);
    worldContainer.add(mountain);
  }
}

export function getRoad() {
  return road;
}
