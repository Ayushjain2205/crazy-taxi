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
  createTrafficSigns(worldContainer);
  createMileMarkers(worldContainer);
  createRoadDecoration(worldContainer);

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
  const treeCount = 60; // Increased tree count
  const treeSpacing = ROAD.LENGTH / treeCount;

  const createTree = (x, z) => {
    // Vary tree sizes
    const scale = 0.7 + Math.random() * 0.6;

    const trunkGeometry = new THREE.CylinderGeometry(
      0.5 * scale,
      0.6 * scale,
      3 * scale,
      8
    );
    const trunkMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0x8a6642).offsetHSL(
        0,
        0,
        (Math.random() - 0.5) * 0.2
      ),
    });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 1.5 * scale;

    // Create multiple leaf layers for more realistic look
    const createLeafLayer = (height, radius, color) => {
      const leavesGeometry = new THREE.ConeGeometry(
        radius * scale,
        height * scale,
        8
      );
      const leavesMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(color).offsetHSL(
          0,
          0,
          (Math.random() - 0.5) * 0.1
        ),
      });
      const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
      leaves.position.y = (height * scale) / 2;
      return leaves;
    };

    const leafGroup = new THREE.Group();
    leafGroup.position.y = 3 * scale;

    // Add multiple layers of leaves with slight variations
    leafGroup.add(createLeafLayer(5, 2.5, 0x3a7d44));
    leafGroup.add(createLeafLayer(4, 2.2, 0x2d6a34));
    leafGroup.add(createLeafLayer(3, 1.8, 0x458b50));

    const tree = new THREE.Group();
    tree.add(trunk);
    tree.add(leafGroup);

    // Add some random rotation for variety
    tree.rotation.y = Math.random() * Math.PI * 2;
    tree.position.set(x, 0, z);
    worldContainer.add(tree);
  };

  // Create trees on both sides of the road with more natural clustering
  for (let i = 0; i < treeCount; i++) {
    const z = i * treeSpacing + (Math.random() - 0.5) * treeSpacing * 0.5;

    // Create clusters of 1-3 trees on each side
    const createCluster = (baseX) => {
      const clusterSize = Math.random() < 0.3 ? 3 : Math.random() < 0.5 ? 2 : 1;
      for (let j = 0; j < clusterSize; j++) {
        const offset = (Math.random() - 0.5) * 8;
        const x = baseX + offset;
        createTree(x, z + (Math.random() - 0.5) * 5);
      }
    };

    // 80% chance for trees on each side
    if (Math.random() < 0.8) {
      createCluster(-ROAD.WIDTH / 2 - 15 - Math.random() * 10);
    }
    if (Math.random() < 0.8) {
      createCluster(ROAD.WIDTH / 2 + 15 + Math.random() * 10);
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

function createTrafficSigns(worldContainer) {
  const signTypes = [
    { text: "SPEED\nLIMIT\n80", color: 0xffffff, shape: "circle", size: 2.5 },
    { text: "CURVE\nAHEAD", color: 0xffff00, shape: "triangle", size: 2.5 },
    { text: "MERGE", color: 0xffff00, shape: "triangle", size: 2.5 },
    { text: "EXIT\n500m", color: 0x00ff00, shape: "rectangle", size: 3 },
  ];

  const signSpacing = ROAD.LENGTH / 8; // 8 signs along the road
  const distanceFromRoad = ROAD.WIDTH / 2 + 8;

  signTypes.forEach((sign, index) => {
    // Place each sign type twice, on alternating sides
    [0, 1].forEach((instance) => {
      const z = 200 + (index * 2 + instance) * signSpacing;
      const side = instance === 0 ? -1 : 1;

      // Create post
      const postGeometry = new THREE.CylinderGeometry(0.1, 0.1, 4, 8);
      const postMaterial = new THREE.MeshBasicMaterial({ color: 0x666666 });
      const post = new THREE.Mesh(postGeometry, postMaterial);
      post.position.set(side * distanceFromRoad, 2, z);

      // Create sign based on shape
      let signGeometry;
      if (sign.shape === "circle") {
        signGeometry = new THREE.CircleGeometry(sign.size / 2, 32);
      } else if (sign.shape === "triangle") {
        signGeometry = new THREE.BufferGeometry();
        const vertices = new Float32Array([
          0,
          sign.size / 2,
          0,
          -sign.size / 2,
          -sign.size / 2,
          0,
          sign.size / 2,
          -sign.size / 2,
          0,
        ]);
        signGeometry.setAttribute(
          "position",
          new THREE.BufferAttribute(vertices, 3)
        );
      } else {
        signGeometry = new THREE.PlaneGeometry(sign.size, sign.size);
      }

      const signMaterial = new THREE.MeshBasicMaterial({
        color: sign.color,
        side: THREE.DoubleSide,
      });
      const signMesh = new THREE.Mesh(signGeometry, signMaterial);
      signMesh.position.y = 4;

      // Create text
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 256;
      const context = canvas.getContext("2d");

      context.fillStyle = sign.color === 0xffffff ? "#ffffff" : "#000000";
      context.fillRect(0, 0, canvas.width, canvas.height);

      context.fillStyle = sign.color === 0xffffff ? "#000000" : "#ffffff";
      context.font = "bold 48px Arial";
      context.textAlign = "center";
      context.textBaseline = "middle";

      // Handle multiline text
      const lines = sign.text.split("\n");
      const lineHeight = 48;
      lines.forEach((line, i) => {
        context.fillText(
          line,
          canvas.width / 2,
          canvas.height / 2 -
            ((lines.length - 1) * lineHeight) / 2 +
            i * lineHeight
        );
      });

      const texture = new THREE.CanvasTexture(canvas);
      signMesh.material.map = texture;
      signMesh.material.needsUpdate = true;

      // Group post and sign
      const signGroup = new THREE.Group();
      signGroup.add(post);
      signGroup.add(signMesh);

      // Rotate sign to face the road
      signMesh.rotation.y = side < 0 ? Math.PI - Math.PI / 6 : Math.PI / 6;

      worldContainer.add(signGroup);
    });
  });
}

function createMileMarkers(worldContainer) {
  const markerSpacing = 100; // Every 100 units
  const markerCount = Math.floor(ROAD.LENGTH / markerSpacing);

  for (let i = 0; i < markerCount; i++) {
    const z = i * markerSpacing;

    // Create marker post
    const postGeometry = new THREE.BoxGeometry(0.3, 1.5, 0.3);
    const postMaterial = new THREE.MeshBasicMaterial({ color: 0xe0e0e0 });
    const post = new THREE.Mesh(postGeometry, postMaterial);

    // Position on right side of road
    post.position.set(ROAD.WIDTH / 2 + 5, 0.75, z);

    // Add distance text
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const context = canvas.getContext("2d");

    context.fillStyle = "#e0e0e0";
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = "#000000";
    context.font = "bold 48px Arial";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(i.toString(), canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    const markerGeometry = new THREE.PlaneGeometry(1, 1);
    const markerMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide,
    });

    const marker = new THREE.Mesh(markerGeometry, markerMaterial);
    marker.position.set(ROAD.WIDTH / 2 + 5, 1.5, z);
    marker.rotation.y = Math.PI / 4; // Angle for visibility

    worldContainer.add(post);
    worldContainer.add(marker);
  }
}

function createRoadDecoration(worldContainer) {
  // Create rocks with more natural clustering
  const createRockCluster = (baseX, baseZ) => {
    const clusterSize = 1 + Math.floor(Math.random() * 3);
    for (let i = 0; i < clusterSize; i++) {
      const size = 0.5 + Math.random() * 1.5;
      // Use more complex geometry for rocks
      const rockGeometry = new THREE.DodecahedronGeometry(size, 1);

      // Deform the geometry slightly for more natural look
      const positions = rockGeometry.attributes.position;
      for (let j = 0; j < positions.count; j++) {
        positions.setXYZ(
          j,
          positions.getX(j) + (Math.random() - 0.5) * 0.2,
          positions.getY(j) + (Math.random() - 0.5) * 0.2,
          positions.getZ(j) + (Math.random() - 0.5) * 0.2
        );
      }

      const rockMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(0x808080).offsetHSL(
          0,
          0,
          (Math.random() - 0.5) * 0.2
        ),
      });
      const rock = new THREE.Mesh(rockGeometry, rockMaterial);

      const offsetX = (Math.random() - 0.5) * 4;
      const offsetZ = (Math.random() - 0.5) * 4;
      rock.position.set(baseX + offsetX, size / 2, baseZ + offsetZ);
      rock.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      worldContainer.add(rock);
    }
  };

  // Create rock clusters
  const rockClusterCount = 20;
  for (let i = 0; i < rockClusterCount; i++) {
    const z = Math.random() * ROAD.LENGTH;
    const side = Math.random() < 0.5 ? -1 : 1;
    const x = side * (ROAD.WIDTH / 2 + 20 + Math.random() * 15);
    createRockCluster(x, z);
  }

  // Create more natural looking bushes
  const createBushCluster = (baseX, baseZ) => {
    const clusterSize = 1 + Math.floor(Math.random() * 4);
    const bushGroup = new THREE.Group();

    for (let i = 0; i < clusterSize; i++) {
      const size = 1 + Math.random() * 1.5;
      // Create multiple spheres for each bush
      const createBushPart = () => {
        const partGeometry = new THREE.SphereGeometry(
          size * (0.6 + Math.random() * 0.4)
        );
        const partMaterial = new THREE.MeshBasicMaterial({
          color: new THREE.Color(0x2d5a27).offsetHSL(
            0,
            0,
            (Math.random() - 0.5) * 0.15
          ),
        });
        const part = new THREE.Mesh(partGeometry, partMaterial);
        part.scale.y = 0.7 + Math.random() * 0.3;
        return part;
      };

      const bush = new THREE.Group();
      const parts = 2 + Math.floor(Math.random() * 3);

      for (let j = 0; j < parts; j++) {
        const part = createBushPart();
        part.position.set(
          (Math.random() - 0.5) * size * 0.5,
          (Math.random() - 0.5) * size * 0.3,
          (Math.random() - 0.5) * size * 0.5
        );
        bush.add(part);
      }

      bush.position.set(
        baseX + (Math.random() - 0.5) * 3,
        size / 2,
        baseZ + (Math.random() - 0.5) * 3
      );
      bushGroup.add(bush);
    }

    worldContainer.add(bushGroup);
  };

  // Create bush clusters
  const bushClusterCount = 30;
  for (let i = 0; i < bushClusterCount; i++) {
    const z = Math.random() * ROAD.LENGTH;
    const side = Math.random() < 0.5 ? -1 : 1;
    const x = side * (ROAD.WIDTH / 2 + 12 + Math.random() * 10);
    createBushCluster(x, z);
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

  // Create a group for all finish line elements
  const finishLine = new THREE.Group();
  finishLine.position.y = 0.01; // Just above the road to prevent z-fighting
  finishLine.position.z = finishLinePosition;

  // Mark the finish line for collision detection
  finishLine.userData = {
    isFinishLine: true,
    isObstacle: false,
  };

  // Create a checkered finish line (ground)
  const finishLineWidth = ROAD.WIDTH + 4; // Wider than the road
  const finishLineDepth = 5;
  const tileWidth = 2;
  const numTiles = Math.ceil(finishLineWidth / tileWidth);

  // Create ground tiles group
  const groundTiles = new THREE.Group();
  for (let i = 0; i < numTiles; i++) {
    const xPos = i * tileWidth - finishLineWidth / 2 + tileWidth / 2;
    const tileColor = i % 2 === 0 ? 0xffffff : 0x000000;
    const tileGeometry = new THREE.PlaneGeometry(tileWidth, finishLineDepth);
    const tileMaterial = new THREE.MeshBasicMaterial({
      color: tileColor,
      side: THREE.DoubleSide,
    });
    const tile = new THREE.Mesh(tileGeometry, tileMaterial);
    tile.rotation.x = -Math.PI / 2;
    tile.position.x = xPos;
    groundTiles.add(tile);
  }
  finishLine.add(groundTiles);

  // Create grand arch
  const archHeight = 15;
  const archWidth = ROAD.WIDTH + 8;
  const archThickness = 1;

  // Create arch pillars with blue and white stripes
  const stripeHeight = 2; // Height of each stripe
  const numStripes = Math.ceil(archHeight / stripeHeight);

  // Create pillars with stripes
  for (let i = 0; i < numStripes; i++) {
    const stripeGeometry = new THREE.BoxGeometry(2, stripeHeight, 2);
    const stripeMaterial = new THREE.MeshBasicMaterial({
      color: i % 2 === 0 ? 0x0066cc : 0xffffff, // Alternate blue and white
    });

    // Left pillar stripe
    const leftStripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
    leftStripe.position.set(
      -archWidth / 2,
      i * stripeHeight + stripeHeight / 2,
      0
    );
    finishLine.add(leftStripe);

    // Right pillar stripe
    const rightStripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
    rightStripe.position.set(
      archWidth / 2,
      i * stripeHeight + stripeHeight / 2,
      0
    );
    finishLine.add(rightStripe);
  }

  // Create arch top with stripes
  const archSegments = 16; // Number of segments in the arch
  const segmentAngle = Math.PI / archSegments;
  const radius = archWidth / 2;

  for (let i = 0; i < archSegments; i++) {
    const startAngle = i * segmentAngle;
    const endAngle = (i + 1) * segmentAngle;

    const archSegmentGeometry = new THREE.CylinderGeometry(
      archThickness,
      archThickness,
      archWidth / archSegments,
      8,
      1,
      false,
      startAngle,
      segmentAngle
    );

    const archSegmentMaterial = new THREE.MeshBasicMaterial({
      color: i % 2 === 0 ? 0x0066cc : 0xffffff, // Alternate blue and white
    });

    const archSegment = new THREE.Mesh(
      archSegmentGeometry,
      archSegmentMaterial
    );
    archSegment.position.y = archHeight;
    archSegment.rotation.z = Math.PI / 2;
    archSegment.position.x = radius * Math.cos(startAngle + segmentAngle / 2);
    archSegment.position.y =
      archHeight - radius * Math.sin(startAngle + segmentAngle / 2);
    finishLine.add(archSegment);
  }

  // Add "CHECKPOINT" text
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 128;
  const context = canvas.getContext("2d");

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#000000";
  context.font = "bold 64px Arial";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText("CHECKPOINT", canvas.width / 2, canvas.height / 2);

  const textTexture = new THREE.CanvasTexture(canvas);
  const textGeometry = new THREE.PlaneGeometry(12, 3);
  const textMaterial = new THREE.MeshBasicMaterial({
    map: textTexture,
    transparent: true,
    side: THREE.DoubleSide,
  });
  const textMesh = new THREE.Mesh(textGeometry, textMaterial);
  textMesh.position.set(0, archHeight - 3, 0);
  textMesh.rotation.y = Math.PI;
  finishLine.add(textMesh);

  // Add finish line to the world
  worldContainer.add(finishLine);
  console.log(
    "Finish line created and added to world at Z:",
    finishLinePosition
  );

  return finishLine;
}

function createBillboards(worldContainer) {
  const billboardCount = 32; // Doubled from 16 to 32
  const billboardSpacing = (ROAD.LENGTH / billboardCount) * 0.8;
  const billboardWidth = 20;
  const billboardHeight = 10;
  const distanceFromRoad = ROAD.WIDTH / 2 + 12;

  // Advertisement messages
  const advertisements = [
    "Put your ads here!",
    "Ads by Crazy Taxi",
    "iyushjain.com",
    "Your Ad Could Be Here",
    "Ad Space Available",
    "Best Taxi Game",
  ];

  for (let i = 0; i < billboardCount; i++) {
    const z = 150 + i * billboardSpacing;
    const side =
      Math.random() < 0.7 ? (i % 2 === 0 ? -1 : 1) : i % 2 === 0 ? 1 : -1;
    const x = side * (distanceFromRoad + Math.random() * 5);

    // Create the billboard structure
    const postGeometry = new THREE.CylinderGeometry(0.5, 0.5, 8, 8);
    const postMaterial = new THREE.MeshBasicMaterial({ color: 0x4a4a4a });
    const post = new THREE.Mesh(postGeometry, postMaterial);
    post.position.y = 4;

    // Create the sign panel
    const signGeometry = new THREE.PlaneGeometry(
      billboardWidth * (0.8 + Math.random() * 0.4),
      billboardHeight * (0.8 + Math.random() * 0.4)
    );
    const signMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      side: THREE.DoubleSide,
    });
    const sign = new THREE.Mesh(signGeometry, signMaterial);
    sign.position.y = 9;

    // Create text for the billboard
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 256;
    const context = canvas.getContext("2d");

    // Set background with slight color variation
    const bgColor = Math.random() < 0.3 ? "#f0f0f0" : "#ffffff";
    context.fillStyle = bgColor;
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Add text with lateral inversion
    context.save();
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.fillStyle = "#000000";
    context.font = "bold 48px Arial";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(
      advertisements[i % advertisements.length],
      canvas.width / 2,
      canvas.height / 2
    );
    context.restore();

    // Create texture from canvas
    const texture = new THREE.CanvasTexture(canvas);
    sign.material.map = texture;
    sign.material.needsUpdate = true;

    // Group post and sign
    const billboard = new THREE.Group();
    billboard.add(post);
    billboard.add(sign);

    // Position the billboard with slight random height variation
    billboard.position.set(x, Math.random() * 0.5, z);

    // Adjust rotation to face oncoming traffic
    if (side < 0) {
      // Left side of road - face towards oncoming traffic
      sign.rotation.y = -Math.PI / 6; // Rotate slightly inward
    } else {
      // Right side of road - face towards oncoming traffic
      sign.rotation.y = Math.PI / 6; // Rotate slightly inward
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
