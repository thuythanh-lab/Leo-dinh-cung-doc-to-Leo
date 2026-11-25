# Changelog

Milestones V0.1 to V1.0 were assembled from the finished, tested Phase 1 code when the repository was connected. Each one builds on its own.

## V3.0 - The Đốc Tờ Era (complete game)
- Level 7: supervisor approval ("Not bad.") and the Reviewer #2 fight
- Cinematics: the defence, beyond the summit, congratulatory letter, Academic Oracle with five career predictions
- Letter and oracle reopen from the title screen after completion, even after starting over
- Three new achievements, all milestones in the CV, world map complete
- No new dependencies; existing music reused; saves and audio settings kept

## V2.4 - Soundtrack import
- Import an MP3 before starting (title screen, or the prompt on Start the PhD) or in Settings; kept in IndexedDB, never uploaded
- It becomes the one gameplay soundtrack and plays exactly as recorded: no trimming, level changes or edits
- The composed theme from V2.3 is removed; without an import the licensed level tracks play
- Any Hedwig file is now git-ignored everywhere

## V2.3 - Original orchestral theme and Choose Your Own Soundtrack
- New original waltz (3:47, celesta, strings, woodwinds, harp, horn) is the continuous gameplay soundtrack on the public site
- Settings: choose an MP3 from the device; kept in IndexedDB, never uploaded; one button restores the original
- Play.bat keeps the private local song; boss, cinematic and menu music and sound effects unchanged

## V2.2 - One gameplay soundtrack (local)
- Locally, the local MP3 replaces every level track and the world map theme as one continuous song; it survives level changes, deaths and respawns, and resumes after bosses and cinematics
- Title, cinematic and boss music and all sound effects unchanged; crisis room ambience plays underneath
- Public site unchanged: licensed level tracks, MP3 not published

## V2.1 - Local main theme
- On this computer only, the world map theme (also the conference break) can be replaced by a local MP3 with a blended loop; it resumes instead of restarting
- The MP3 is not published: redistribution rights are not confirmed, so the public site keeps the licensed track
- Fixed: a track whose scene closed before it finished loading could be skipped later

## V2.0 - Phase 2: The Fieldwork Survival Era
- Level 6: Into the Field and The Dissertation Era, joined by a portal
- Flooding river, landslide, water buffalo, collapsing rope bridge with a lower detour
- Stress cloud, Writer's Block cursor, Supervisor Feedback stamps
- Fieldwork Completed and All Chapters Completed achievements
- Phase 2 ending with the ridge zoom-out; world map and CV extended
- Existing saves keep everything; Phase 1 finishers unlock level 6
- Backdrop widened by 10 px each side so screen shake no longer shows the edge

## V1.0 - Phase 1 complete and tested
- Verified on the live GitHub Pages URL; GitHub Actions publishes to gh-pages
- Share metadata, final test report
- Automated playthrough and system tests
- GitHub Actions deployment
- Design documentation

## V0.9 - Cinematics, audio and visual polish
- Opening and Phase 1 ending cinematics

## V0.8 - Academic CV and achievement system
- Academic CV notebook with 14 entries

## V0.7 - Bureaucratic Labyrinth
- Three stamps and CÔNG VĂN walls
- The Guardian of the Official Stamp

## V0.6 - Funding Hunger Games
- Funding collapse and three application sections
- Funding portal finale, Conference Buffet

## V0.5 - Q1 Publication Tower
- Rejection letters, major revision, paywall
- The Editorial Machine

## V0.4 - Three legendary scholar encounters
- Water & Power Observatory
- Garden of Entangled Worlds
- Invisible Infrastructure Archives
- Theoretical framework, Research Rabbit Hole

## V0.3 - University campus and Research Assistant
- Level 1 complete
- Research Assistant: 10 s active, 30 s cooldown
- Secret: Emergency Existential Crisis Room

## V0.2 - Léo character and platforming mechanics
- Léo with 17 animations
- Run, jump, slide, climb, swim, magic pen
- Platforms, enemies, obstacles, checkpoints, HUD, menus, world map
- Temporary test ground

## V0.1 - Project setup and asset integration
- Phaser 3 and Vite project
- Art and audio pipelines, processed assets and licences
- Editable text, balance and achievement config
- Save, audio, input and UI core
