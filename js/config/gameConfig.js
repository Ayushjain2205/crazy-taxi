// Game configuration constants

export const ROAD = {
  WIDTH: 12,
  LENGTH: 10000,
  COLOR: 0x505050,
};

export const LANES = {
  POSITIONS: [4, 0, -4], // Left, Middle, Right
  COUNT: 3,
};

export const TAXI = {
  COLOR: 0xffff00,
  WIDTH: 2,
  HEIGHT: 1,
  LENGTH: 4,
  DEFAULT_Y: 0.5,
  INITIAL_POSITION: { x: 0, y: 0.5, z: -5 },
};

export const TRAFFIC = {
  COLOR: 0xff0000,
  INITIAL_COUNT: 15,
};

export const GAME = {
  INITIAL_LEVEL: 1,
  TIME_LIMIT: 30,
  INITIAL_SPEED: 10,
  MIN_SPEED: 0,
  MAX_SPEED: 100,
  JUMP_DURATION: 1,
  MAX_JUMP_HEIGHT: 2,
  DISTANCE_GOAL: 1000, // Distance goal in meters
  TIME_DECREASE_PER_LEVEL: 5, // How much time to decrease per level
  MIN_TIME_LIMIT: 15, // Minimum time limit for any level
};

export const SKY = {
  COLORS: [0xc0e0ff, 0x9ec5ff], // Top, Bottom
};

export const MARKINGS = {
  COLOR: 0xcccccc,
};

export const GRASS = {
  COLOR: 0x519868,
  WIDTH: 20,
};

export const COLLISION = {
  THRESHOLD_X: 2,
  THRESHOLD_Z: 3,
};

export const EXPLOSION = {
  COLOR: 0xff5500,
};

export const COINS = {
  RADIUS: 0.5,
  HEIGHT: 0.2,
  COLOR: 0xffd700,
  ROTATION_SPEED: 2,
  HOVER_AMPLITUDE: 0.2,
  HOVER_SPEED: 2,
  POINTS: 50,
  SPAWN_CHANCE: 0.4, // 40% chance to spawn a coin at each position
};

export const POWERUPS = {
  TYPES: {
    SPEED_BOOST: {
      COLOR: 0x00ff00,
      DURATION: 5, // seconds
      MULTIPLIER: 1.5,
      MODEL_SCALE: 0.8,
    },
    TIME_BONUS: {
      COLOR: 0x0000ff,
      TIME_ADDED: 10, // seconds
      MODEL_SCALE: 0.8,
    },
    INVINCIBILITY: {
      COLOR: 0xff0000,
      DURATION: 8, // seconds
      MODEL_SCALE: 0.8,
    },
  },
  RADIUS: 0.7,
  HEIGHT: 0.7,
  ROTATION_SPEED: 1.5,
  HOVER_AMPLITUDE: 0.3,
  HOVER_SPEED: 1.5,
  SPAWN_CHANCE: 0.2, // 20% chance to spawn a power-up at each position
};

export const GREASE = {
  COLOR: 0x1a1a1a,
  WIDTH: 4,
  LENGTH: 8,
  SPAWN_CHANCE: 0.15,
  SLOWDOWN_FACTOR: 0.1,
  EFFECT_DURATION: 1.5,
  OPACITY: 0.7,
};
