import Phaser from 'phaser';
import '@fontsource/vt323/400.css';
import '@fontsource/handjet/700.css';
import './style.css';
import { VIEW } from './config/balance.js';
import LevelScene from './scenes/LevelScene.js';
import HUD from './scenes/HUD.js';
import { Boot, Title, TitleUI, Map_, Settings, Pause } from './scenes/menus.js';
import { CV } from './scenes/cv.js';
import { Intro, IntroUI, Ending, EndingUI } from './scenes/cinematics.js';
import { Ending2, Ending2UI } from './scenes/ending2.js';

const game = new Phaser.Game({
  type: Phaser.AUTO, parent: 'game', width: VIEW.width, height: VIEW.height, backgroundColor: '#140e20', pixelArt: true, roundPixels: true,
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH, fullscreenTarget: 'game' },
  physics: { default: 'arcade', arcade: { gravity: { y: 0 }, tileBias: 16, fixedStep: false, customUpdate: true } },
  input: { activePointers: 4 }, loader: { maxRetries: 5 }, audio: { disableWebAudio: false },
  scene: [Boot, Title, TitleUI, Intro, IntroUI, Map_, LevelScene, HUD, CV, Settings, Pause, Ending, EndingUI, Ending2, Ending2UI],
});
window.__game = game;
if (location.search.includes('debug')) import('./core/Input.js').then((m) => { window.__C = m.Controls; });
