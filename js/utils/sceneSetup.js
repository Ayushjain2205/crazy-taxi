// Scene, camera, renderer setup
import { SKY } from "../config/gameConfig.js";

let scene, camera, renderer;
let worldContainer;
let sky, sun;

export function initScene() {
  // Set up the scene
  scene = new THREE.Scene();

  // Set up the camera
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  // Position the camera - raised higher for better view
  camera.position.set(0, 7, -20);
  camera.lookAt(0, 0, 30); // Look further ahead

  // Set up the renderer
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  document.body.appendChild(renderer.domElement);

  // Create game world container - everything will move inside this
  worldContainer = new THREE.Group();
  // Set initial position of world container so road starts properly
  worldContainer.position.z = -50;
  scene.add(worldContainer);

  // Handle window resize
  window.addEventListener("resize", handleResize);

  // Add lights to the scene
  addLights();

  // Create sky and sun
  createSky();

  return {
    scene,
    camera,
    renderer,
    worldContainer,
  };
}

function handleResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function addLights() {
  // Add ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);

  // Add directional light
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
  directionalLight.position.set(50, 100, 0);
  directionalLight.castShadow = true;
  scene.add(directionalLight);
}

function createSky() {
  // Create sky background
  const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
  const skyMaterial = new THREE.ShaderMaterial({
    uniforms: {
      topColor: { value: new THREE.Color(SKY.COLORS[0]) },
      bottomColor: { value: new THREE.Color(SKY.COLORS[1]) },
    },
    vertexShader: `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 topColor;
      uniform vec3 bottomColor;
      varying vec3 vWorldPosition;
      void main() {
        float h = normalize(vWorldPosition + vec3(0.0, 0.1, 0.0)).y;
        gl_FragColor = vec4(mix(bottomColor, topColor, max(0.0, h)), 1.0);
      }
    `,
    side: THREE.BackSide,
  });

  sky = new THREE.Mesh(skyGeometry, skyMaterial);
  scene.add(sky); // Sky stays in scene, not in worldContainer

  // Create sun
  const sunGeometry = new THREE.SphereGeometry(10, 32, 32);
  const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xfffae6 });
  sun = new THREE.Mesh(sunGeometry, sunMaterial);
  sun.position.set(100, 100, -200);
  scene.add(sun); // Sun stays in scene, not in worldContainer
}

export function getScene() {
  return scene;
}

export function getCamera() {
  return camera;
}

export function getRenderer() {
  return renderer;
}

export function getWorldContainer() {
  return worldContainer;
}
