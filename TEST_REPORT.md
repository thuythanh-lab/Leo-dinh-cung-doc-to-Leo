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

## System checks on the deployed site: 21 of 21 passed
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
