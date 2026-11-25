# Asset manifest

Source packs are read by the tools, never modified. Only the processed output in `public/assets/` is committed.

| Asset | Source | Licence | Used for |
|---|---|---|---|
| RPG Audio, Interface Sounds | Kenney (kenney.nl) | CC0 | 27 sound effects, re-encoded to MP3 |
| 28 High Quality 16-bit RPG Music | HydroGene (hydrogene.itch.io) | Free to use in any way, credit optional | 13 music tracks, re-encoded to mono MP3 |
| Fantasy Lands Basic Package | Vairus Studio (vairus-studio.itch.io) | Use and modify in projects; no standalone redistribution | Bushes, mushrooms, rocks, merged into the game atlas |
| Earlier personal game art | The repository owner's own project | Owner's work | Statues, portraits, chandelier, torches, clocks, orrery, furniture |
| VT323, Handjet | Google Fonts via Fontsource | SIL OFL | All text, including Vietnamese |
| Everything else in `art/` and `characters/` | Original, drawn by `tools/art/` | Original | Léo, assistant, scholars, NPCs, enemies, bosses, 8 tilesets, 9 parallax worlds, map, notebook, icons, UI |
| 22 chip effects, nature ambience | Original, synthesised by `tools/audio/` | Original | Jump, stamps, fanfares, summoning, wind and birds |

Reviewed but not used: Kenney Tiny Town and Tiny Dungeon (top-down), Tiny Pixel Fantasy Character Generator (too small for recognisable glasses and hair). Kenney Pixel Platformer was not available locally and was not needed.

Pack licence texts are in `public/assets/licenses/`. To rebuild assets, set `LEO_PACKS` to the folder holding the extracted packs.

## Phase 2
New art is original, drawn by `tools/art/phase2.py` and appended to the atlas; Phase 1 atlas pixels are unchanged. Music and sound effects reuse the existing tracks and the Kenney RPG Audio and Interface Sounds packs. Nothing was downloaded. `tools/art/build.py` rewrites the atlas, so run `phase2.py` after it.

## Local-only audio (not redistributed)
`assets/audio/Harry Potter Hedwig s Song HQ.mp3`: redistribution rights not confirmed. Git-ignored, never copied to `dist`, served only by the local Vite servers. Public soundtrack: `wizard.mp3`.

## Original music
`public/assets/audio/music/wizard.mp3`, "Waltz for an Unfinished Thesis": composed for this game and synthesised by `tools/audio/wizard.py` (no samples). The earlier level tracks stay as a fallback if it cannot load.
