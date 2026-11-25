# Game design

A 2D pixel-art platformer about a PhD, told as a climb up a mountain. A personal congratulatory gift for Léo.

## Mechanics
- **Movement:** acceleration, variable jump, coyote time, jump buffering, apex hang, slide, ladders, one-way drop, swimming. Logic runs in fixed sub-steps so it behaves the same at any frame rate.
- **Sanity:** three hearts. Special coffee and coffee machines (checkpoints) restore it. Falling or hazards return Léo to safe ground.
- **Magic pen:** small projectile, also types through writer's block, flips switches and chips any breakable barrier.
- **Research Assistant:** 10 seconds of gameplay time, 30-second cooldown, targets barriers and minor enemies. Permanent across phases. Never required: the pen always works, so it cannot softlock.
- **Obstacles:** rejection letters, major revision, funding rejection, denied permission, paperwork, stress clouds, writer's block, paywall, stampers, conveyors.

## Phase 1: The Academic Delulu Era
| Level | Idea | Mechanic focus |
|---|---|---|
| 1 Welcome to Academia | Arrive, learn to delegate | Core platforming, assistant |
| 2 Hall of Legendary Scholars | Assemble a theoretical framework | Water levels, entangled ecosystem, hidden infrastructure |
| 3 Q1 Publication Tower | Get published | Vertical climb, page recovery, Editorial Machine |
| 4 Funding Hunger Games | Get funded | Timed cells, bouncing coins and scales, stampers and portals |
| 5 Bureaucracy: The Final Form | Get permission | Three stamps, lifts, looping doors, Guardian of the Official Stamp |

Scholar dialogue is fictional and labelled as such. Susan Leigh Star appears as a manifestation of her writing.

Secrets: the Emergency Existential Crisis Room (L1), the Research Rabbit Hole (L2), the Conference Buffet (L4).

## Future phases (not started)
- **Phase 2, The Fieldwork Survival Era:** fieldwork, findings, stress, writer's block, chapter revisions.
- **Phase 3, The Đốc Tờ Era:** "Not bad", Reviewer #2, the defence, the summit and the finale.

Hooks: `src/core/future.js`, reserved save slots in `Save.d.future`, append-only achievement list, obstacle base classes in `src/entities/things.js`.

## Phase 2: The Fieldwork Survival Era (level 6)
One map, two zones. Field: five optional research findings, a flood that raises rafts, a landslide (assistant, pen or jump over), a rideable buffalo, and a rope bridge that collapses onto a lower route. Dissertation: five chapter pages, a stress cloud, a cursor that needs the inspiration bulb, and two supervisor stamps that destroy the path and open another. Missing findings or chapters never block the ending. All copy is in `P2` in `src/config/text.js`.

## The Đốc Tờ Era (level 7 and cinematics)
Supervisor scene, one 35-45 s boss in three rounds of 11 s (vague, irrelevant, second dissertation), then no more gameplay: defence, summit, letter, oracle. Predictions are dealt from a shuffled deck of five saved in `future.oracle`. `triumph`, `oracle` and `nem` are music cues that reuse existing files and are never replaced by an imported soundtrack.
