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
