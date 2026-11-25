# Test report: Phase 1 (v1.0-phase1)

Tested 25 November 2026 in headless Chrome on Windows, against the deployed site: https://thuythanh-lab.github.io/Leo-dinh-cung-doc-to-Leo/

## Full playthroughs on the deployed site (real control inputs, bot invulnerable)
| Level | Result | Time | Achievements earned |
|---|---|---|---|
| 1 | Completed | 80 s | Assistant, Caffeine, Productive |
| 2 | Completed | 182 s | Three scholars, Rabbit Hole, Caffeine, Productive |
| 3 | Completed | 107 s | Q1 Publication, Ghosted, Caffeine, Productive |
| 4 | Completed | 103 s | Funding, Un-cooked, Buffet, Caffeine, Productive |
| 5 | Completed | 111 s | Fieldwork Letter, Caffeine, Productive |

All seven mandatory achievements were unlocked. Because the bot was invulnerable, "Unexpectedly Productive" here only shows that it triggers.

## System checks on the deployed site: 23 of 23 passed
Menus and greyed-out options, intro, keyboard, pause, resume, CV, settings, saved volume, checkpoint, death and respawn, pits, refresh and Continue, assistant 10.0 s active (unaffected by pause) and 30 s cooldown, no softlock without the assistant, simulated touch run + jump, ending, return to map.

## Scene load
All ten scenes load. One sound effect returned a temporary HTTP 503 from GitHub during one load. The loader retries failed files up to five times.

## Damage-enabled run (local production build, bot never dodges)
Levels 1, 2 and 4 completed. On levels 3 and 5 the bot script lost its route after dying, so they have not been proven end to end with damage on.

## Known issues and limits
- Not played by a human: feel, difficulty and audio balance are unjudged. Tests ran muted.
- Touch was simulated. Not tested on a physical phone, Safari or Firefox.
- iPhone browsers may not support the fullscreen button.
- "Professional Delegator" (three summons) has no end-to-end test.
- Estimated first play is longer than the 7 to 10 minute target (bot time about 10 minutes with secrets).
- Debug links such as `?level=3` work on the public site and skip progression.

# Phase 2 (25 November 2026)
On the deployed site: level 6 completed by the bot in 105 s; levels 1 to 5 completed again; `tests/phase2.mjs` and `tests/system.mjs` all passed; all scenes load. On the local production build: level 6 also completed with damage on, by the bridge and by the gorge detour. Music: `tests/audio.mjs` passed locally with the local theme and with the licensed fallback. Not judged by a human: feel, difficulty, sound. No physical phone, Safari or Firefox.

# Complete game, v3.0 (deployed site)
Levels 1 to 7 completed by the bot (invulnerable), level 7 also with damage on. `finale.mjs`, `phase2.mjs`, `system.mjs`, `soundtrack.mjs`, `audio.mjs` and scene load checks all passed. Level 7 took the bot 63 s including the supervisor scene; the Reviewer #2 fight took 34 s. One page load timed out during a parallel run and passed on rerun.

Not tested: human play, sound by ear, physical phones, Safari, Firefox. Levels 3 and 5 are still unproven end to end with damage on.
