// Extension points for Phase 3. Nothing here is playable yet.
// Obstacles: subclass Barrier / Enemy / Crusher in entities/things.js and register the id here.
export const FUTURE_OBSTACLES = ['reviewer2_vague', 'reviewer2_second_dissertation'];
// Scenes: each entry will become a Phaser.Scene registered in main.js when its phase is built.
export const FUTURE_SCENES = { summitCinematic: null, congratulatoryLetter: null, fortuneCrystalBall: null };
// Save slots already reserved in Save.d.future
export const futureState = (save, key) => (save.d.future[key] = save.d.future[key] || {});
