# LÉO ĐỈNH CÙNG ĐỐC TỜ LÉO
Phase 1: The Academic Delulu Era. A Phaser 3 + Vite platformer.

## Play
Double-click `Play.bat`, or `npm install` then `npm run dev`.

| Action | Keyboard |
|---|---|
| Move / climb | Arrows or WASD |
| Jump | Space, Z or Up |
| Slide / drop through platforms | Down while running / Down + Jump |
| Magic pen, talk, use | X, J or F |
| Research Assistant | E |
| Pause | Esc or P |

Touch buttons appear on phones. Force them in Settings.

## Edit without touching game code
- `src/config/text.js`: every line of dialogue, sign, toast and ending
- `src/config/balance.js`: movement, assistant duration and cooldown, obstacles
- `src/config/achievements.js`: Academic CV entries
- `public/assets/characters/leo.png` + `leo.json`: Léo's sprite sheet (32x36 frames, one row per animation). Repaint it and nothing else changes. `npm run art` regenerates it, so keep a copy of a hand-painted sheet.

## Structure
Docs: `CHANGELOG.md`, `ASSET_MANIFEST.md`, `GAME_DESIGN.md`, `TEST_REPORT.md`.

`core/` save, audio, input, shared UI, soundtrack import · `entities/` player, assistant, platforms, obstacles, enemies, FX · `levels/` tile builder and the seven levels · `scenes/` level, HUD, menus, map, CV, cinematics · `tools/` art and audio pipelines · `tests/` automated playthrough.

## Test
With `npm run dev -- --port 5210` running: `node tests/playthrough.mjs` (plays all five levels with real inputs) and `node tests/system.mjs` (menus, saves, death, RA timing, touch, ending).
Debug links: `?level=3`, `?scene=CV`, `?scene=Ending`.

## Deploy
Every push to `main` builds through GitHub Actions (`.github/workflows/deploy.yml`) and publishes to the `gh-pages` branch, which GitHub Pages serves.
Public URL: https://thuythanh-lab.github.io/Leo-dinh-cung-doc-to-Leo/

The Vite base is relative (`./`), so all paths resolve under the repository sub-path.

## Phase 2
Finish Phase 1 to unlock level 6 on the world map. Tests: `node tests/phase2.mjs`, `node tests/playthrough.mjs 6 [--mortal] [--detour]`.

## Final phase
Finish Phase 2 to unlock level 7. Copy lives in `P3` in `src/config/text.js`. Art: `tools/art/phase3.py` (run after `phase2.py`). Tests: `node tests/finale.mjs`, `node tests/playthrough.mjs 7`.

## Main background music
The supplied `HGgyd.mp3` is bundled as `public/assets/audio/music/main-theme.mp3` and plays continuously across the map and normal gameplay. Bosses, menu and cinematics keep their existing music. Imported personal soundtracks still override the default; removing an import restores the bundled theme.
