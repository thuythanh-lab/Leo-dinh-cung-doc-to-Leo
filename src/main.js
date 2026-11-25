import Phaser from 'phaser';
import '@fontsource/vt323/400.css';
import './style.css';

class Preview extends Phaser.Scene {
  preload() { this.load.image('map', 'assets/art/worldmap.png'); }
  create() { this.add.image(0, 0, 'map').setOrigin(0, 0).setScale(2); }
}
new Phaser.Game({ parent: 'game', width: 960, height: 540, pixelArt: true, scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH }, scene: Preview });
