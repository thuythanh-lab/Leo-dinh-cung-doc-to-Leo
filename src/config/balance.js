// All tunable numbers live here.
export const VIEW = { width: 960, height: 540, zoom: 2, tile: 16 };

export const PLAYER = {
  runSpeed: 138, accel: 900, airAccel: 720, decel: 1150, airDecel: 420, turnBoost: 1.7,
  jumpSpeed: 352, gravityUp: 930, gravityDown: 1180, maxFall: 420,
  jumpCut: 0.42,          // velocity kept when jump is released early
  coyoteMs: 100, bufferMs: 120,
  apexBoost: 0.72,        // gravity multiplier near the apex (hang time)
  slideSpeed: 225, slideMs: 420, slideCooldownMs: 260,
  climbSpeed: 86,
  stompBounce: 250, hearts: 3, invulnMs: 1400, knockX: 150, knockY: 190,
  castCooldownMs: 300, boltSpeed: 310, boltRange: 190,
  stressSlow: 0.6, stressMs: 6000,
  idleJokeMs: 5200,
  waterGravity: 130, waterMaxFall: 60, waterRise: 150, waterHop: 325, waterDrag: 0.72,
};

export const ASSISTANT = {
  durationMs: 10000,      // exactly ten seconds of gameplay time (pauses with the game)
  cooldownMs: 30000,
  speed: 190, reach: 150, hitEveryMs: 260, damage: 4,
};

export const OBSTACLE = {
  barrierHp: 12,          // Léo's pen can always chip through: no softlocks
  writersHp: 5, fragileMs: 700, fragileRespawnMs: 3200,
  letterEveryMs: 2700, letterSpeed: 120,
  cellPeriodMs: 2300, leafMs: 6500,
};

export const COFFEE = { caffeineGoal: 30, rejectionGoal: 5, delegatorGoal: 3 };
export const CONFERENCE = { seconds: 20 };
