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
  TIME_LIMIT: 60,
  INITIAL_SPEED: 10,
  MIN_SPEED: 10,
  MAX_SPEED: 100,
  JUMP_DURATION: 1,
  MAX_JUMP_HEIGHT: 2,
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
