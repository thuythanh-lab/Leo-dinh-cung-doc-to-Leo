// Every line of copy in the game. Edit freely: gameplay code only refers to keys.
export const TITLE = {
  line1: 'LÉO ĐỈNH CÙNG', line2: 'ĐỐC TỜ LÉO', sub: 'An academically questionable adventure.',
  start: 'Start the PhD', cont: 'Continue the suffering', cv: 'Academic CV', settings: 'Settings',
  confirmNew: 'Start over? Your current PhD will be withdrawn.', yes: 'Withdraw it', no: 'Keep suffering',
  hint: 'Arrows + Enter, or tap',
};
export const INTRO = [
  { t: 'Once upon a time, Léo decided to do a PhD.', ms: 3400 },
  { t: 'He had curiosity, ambition and a dangerously optimistic timeline.', ms: 4000 },
  { t: 'He thought he knew what he was getting into.', ms: 3400 },
  { t: '', ms: 900 },
  { t: 'Bro did not.', ms: 2400, big: true },
];
export const QUEST1 = { title: 'NEW QUEST: BECOME ĐỐC TỜ', sub: 'Difficulty: Academically unreasonable.' };
export const DEATH = ['Bro is cooked.', 'Academic setback detected.', 'PhD.exe has stopped responding.', 'Mentally AFK.', "It's giving burnout."];
export const DEATH_SUB = 'Respawning at the nearest coffee machine...';

export const NAMES = { leo: 'Léo', ra: 'Research Assistant', prof: 'Emeritus Professor', student: 'First-year', margreet: 'Margreet Zwarteveen', donna: 'Donna Haraway', star: 'Susan Leigh Star (a manifestation)' };
export const FICTION_NOTE = 'Fictional dialogue, written with affection.';

export const LEVELS = [
  { id: 1, name: 'Welcome to Academia', sub: 'Delulu: maximum.' },
  { id: 2, name: 'The Hall of Legendary Scholars', sub: 'Please be quiet. The theory is sleeping.' },
  { id: 3, name: 'The Q1 Publication Tower', sub: 'Estimated review time: geological.' },
  { id: 4, name: 'The Funding Hunger Games', sub: 'May the budget line be ever in your favour.' },
  { id: 5, name: 'Bureaucracy: The Final Form', sub: 'Please complete Form 1 to request Form 1.' },
  { id: 6, name: 'The Fieldwork Survival Era', sub: 'Phase 2. The plan was theoretical.', locked: 'Finish Phase 1 first. Something is rustling out there.' },
];
export const FUTURE = [
  { name: 'Phase 3: ???', locked: 'Hidden by clouds. Locked.', soon: 'The Đốc Tờ Era. Still under review.' },
];

export const ASSIST = {
  intro: [['leo', 'There seems to be quite a lot of work.'], ['ra', 'Have you considered delegation?'], ['leo', 'Is that allowed?'], ['ra', 'For ten seconds.']],
  leave: ['My contract has expired.', "That's outside my ToR.", 'Above my pay grade.', 'Please acknowledge me in your thesis.', 'I have my own academic trauma to deal with.', 'No further deliverables.'],
  cooldown: 'The assistant is on leave.',
  nothing: 'Deliverables located!',
  hintKey: 'E', hintTouch: 'assistant button',
};

export const SIGNS = {
  lol: 'Estimated PhD duration: LOL.', delulu: 'Welcome to academia.\nDelulu is the solulu.', coffee: 'Free coffee.\nIn this economy?',
  writers: "Writer's block ahead.\nWrite something. Anything.", stress: 'Beware of stress clouds.\nThey can smell deadlines.', keep: 'Please keep off the grass.\n(You will need it later.)',
  books: 'Overdue books.\nVery overdue books.', lib: 'The Hall of\nLegendary Scholars', quiet: 'Three emblems.\nOne theoretical framework.\nZero certainty.',
  water: 'Water finds a way.\nUsually through a committee.', water2: 'Follow the water.\nThen ask who moved it.', garden: 'Everything here is connected.\nPlease poke responsibly.', archive: 'You only notice it\nwhen it stops working.',
  under1: 'Under review.', under2: 'Still under review.', under3: "Bestie, it's been\neight months.", revise: 'Manuscript complete!\nNothing can go wrong now.', pay: 'Access this platform\nfor only $39.95.', login: 'Institutional login\n(somewhere upstairs)',
  vibes: 'Budget: vibes.', excellent: 'Excellent proposal.\nUnfortunately...', impact: 'Research impact: HIGH.\nAvailable funding: ZERO.', direct: 'Funding: straight ahead!\n100% stable.', sheet: 'Step only on cells\nwith valid formulas.', closed: 'Call for proposals\n(closed)', open: 'Call for proposals\n(allegedly open)',
  f1: 'Floor 1: Forms', f2: 'Floor 2: Forms about forms', f3: 'Floor 3: ???', email: 'This email could have\nbeen an approval.', queue: 'Now serving: 47.\nYour number: 8,412.', who: 'Who even has the authority\nto approve this?',
  room1: 'Room 7B', room2: 'Room 7-B', room3: 'Room B7',
};

export const TALK = {
  prof: [['prof', 'Ah, a new PhD. You have that glow.'], ['leo', 'Ambition?'], ['prof', 'No, the other thing. Sunscreen.'], ['prof', "My advice: never ask anyone how the thesis is going. Including yourself."]],
  student: [['student', 'Is it true you get paid to read?'], ['leo', 'Define "paid".'], ['student', '...'], ['leo', 'Define "read".']],
  margreet: [['leo', 'I moved the water. I think the water also moved me.'], ['margreet', 'Whenever water is redirected, something else is redirected with it.'], ['leo', 'Power?'], ['margreet', 'Now you are looking upstream. Take this, and keep asking who holds the valve.']],
  donna: [['leo', 'I stepped on a flower and a beetle opened a gate.'], ['donna', 'Nothing here does anything alone. Not the beetle, not the flower, not you.'], ['leo', 'So whose achievement is this?'], ['donna', 'Excellent trouble. Stay with it. My dog would like you to have this.']],
  star: [['leo', 'The bridge was there the whole time?'], ['star', 'Good infrastructure is the kind nobody thanks. I am only a page that remembered.'], ['leo', 'I will footnote you forever.'], ['star', 'Footnote the people who keep the lights on, too.']],
  ticket: [['leo', 'It says they are now serving number 47.'], ['leo', 'It also says I am number 8,412.'], ['leo', 'Admin side quest detected.']],
};

export const TOAST = {
  letter: ['Thank you for your submission. Unfortunately...', 'Academic ghosting is crazy.'],
  revision: ['MAJOR REVISION', 'We are so not back.'], revisionDone: 'We are so back.',
  fundingNo: 'Financially humbled.', fundingMore: ["It's giving unfunded research.", 'Excellent proposal. Unfortunately...'],
  writers: 'The blinking cursor is winning.', writersDone: 'He actually cooked.',
  stress: 'Stress cloud: emotionally attached.', stressGone: 'The cloud found someone with a deadline.',
  wallRed: ['The audacity.', 'Bureaucracy is bureaucrac-ing.'], wallStamp: 'Approval required. The form needs another form.',
  wallOpen: 'Approved! (one of several)', roomLoop: ['The form needs another form.', 'Canon event.', 'You have been redirected to yourself.'], roomOk: 'Main character energy.',
  hazard: 'Skill issue.', tower: 'Desk rejected by gravity.', checkpoint: 'Checkpoint: caffeinated.', sanity: 'Sanity restored.',
  paywall: 'Paywall detected. The audacity.', paywallOpen: 'Institutional login accepted. Somehow.',
  comp: { proposal: 'Research Proposal acquired.', budget: 'Budget acquired. It balances if you squint.', just: 'Justification acquired. Bold claims included.' },
  compNeed: 'Application incomplete. Missing: ', stamp: { blue: 'Stamp 1 of 3: Acknowledged.', red: 'Stamp 2 of 3: Noted.', gold: 'Stamp 3 of 3: Reluctantly seen.' },
  crisis: 'Maybe touch some grass.', rabbit: 'Congratulations. None of this is relevant to your dissertation.', rabbitStart: 'Collect the paper. Just one paper.',
  buffet: 'Conference break! Collect everything.', waterLow: 'The water withdraws.', waterMid: 'The water returns.', waterHigh: 'The water is rising!', wheel: 'The wheel remembers how to turn.',
  podGrow: 'Something grew.', beetle: 'The beetle has joined the assemblage.', root: 'The roots agree to let go.', reveal: ['It was there all along.', 'Infrastructure: now legible.', 'The system has more systems.'],
  hall: 'Find three scholars.', dais: 'The three emblems start to hum...', bossMachine: 'THE EDITORIAL MACHINE', bossMachineSub: 'Recover 3 manuscript components. Deliver each to a revision station.', deliver: 'Deliver it to the glowing revision station!', bossStamp: 'THE GUARDIAN OF THE OFFICIAL STAMP', bossStampSub: 'Reach the official letter.',
  noDamage: 'No sanity lost. Suspicious.', secret: 'SECRET AREA', resume: 'Resuming from your last coffee.',
};

export const BIG = {
  ra: ['RESEARCH ASSISTANT UNLOCKED', 'Delegation era begins.'],
  framework: ['THEORETICAL FRAMEWORK ASSEMBLED', 'Critical thinking: +100', 'Existential questions: +999', 'Certainty: −50', 'Bro unlocked the academic lore.'],
  accepted: 'DECISION: ACCEPTED.', funded: 'FUNDING APPROVED', approved: 'APPROVED', approvedVi: 'Công văn đã được duyệt.',
  wall: 'CÔNG VĂN CHƯA ĐƯỢC DUYỆT',
  rejLetter: 'PUBLICATION REJECTED', rejFund: 'FUNDING REJECTED', denied: 'PERMISSION DENIED',
};

export const ENDING = {
  lines: ['The theoretical framework was assembled.', 'The paper was published.', 'The funding was secured.', 'The paperwork was, against all odds, approved.', null, 'Léo was finally ready for fieldwork.', 'Surely, the hard part was over.', null],
  bro: 'Bro.',
  card: ['PHASE 1 COMPLETE', 'THE ACADEMIC DELULU ERA'],
  stats: ['Academic CV: Looking respectable.', 'Sanity: Debatable.', 'Research funding: Secured.', 'Fieldwork permission: Somehow approved.'],
  next: ['NEXT QUEST: THE FIELDWORK SURVIVAL ERA', 'Reality is about to enter the chat.'],
};

export const UI = {
  paused: 'PAUSED', pausedSub: 'Your supervisor has noticed.', resume: 'Resume', restart: 'Restart level', map: 'World map', settings: 'Settings', cv: 'Academic CV', title: 'Title screen',
  music: 'Music', sfx: 'Sound effects', full: 'Fullscreen', touch: 'Touch controls', auto: 'Auto', on: 'On', off: 'Off', back: 'Back', mapHint: 'Choose a destination. Enter / tap to travel.', skip: 'Skip ▸',
  cvTitle: 'ACADEMIC CV', cvName: 'Léo, PhD candidate', cvMain: 'Milestones', cvSecret: 'Footnotes (secret)', cvLocked: '???', cvFuture: 'Future chapters: redacted', cvHint: 'Not yet peer reviewed.', cvPubs: 'Publications', complete: 'LEVEL COMPLETE', rotate: 'Best played in landscape.',
  controls: 'Move: Arrows / WASD    Jump: Space    Slide: Down while running\nMagic pen + interact: X or J    Assistant: E    Pause: Esc',
};

// ------------------------------------------------------------------ Phase 2
export const P2 = {
  intro: ['THE FIELDWORK SURVIVAL ERA', 'Phase 2. The plan was theoretical.'],
  flood: 'The field did not read your proposal.', slide: 'Reality has entered the chat.', buffalo: "It wasn't on the bingo card.", bridge: 'Methodology left the chat.',
  finding: ['Finding 1: it depends.', 'Finding 2: it depends on the river.', 'Finding 3: unexpected, therefore novel.', 'Finding 4: n = 1, but a very good 1.', 'Finding 5: contradicts findings 1 to 4.'],
  findings: (n) => (n >= 5 ? 'All 5 findings collected. Suspiciously thorough.' : `${n}/5 findings. The rest are "future research".`),
  goat: 'Participant 7 ate the consent form.', grass: ['FIELDWORK COMPLETED', 'Touched grass. For research purposes.'],
  zone2: ['THE DISSERTATION ERA', 'Now write all of it down.'],
  stress: 'Mentally AFK.', stressGone: 'The cloud found someone with a deadline.', stressHit: 'Stress delegated.',
  block: 'No thoughts. Just vibes.', bulb: 'Inspiration acquired!', blockDone: "We're so back.",
  rewrite: 'Not the chapter revision again.', rewriteAlt: 'New route suggested in the comments.', rewrite2: 'The audacity.', crushed: 'Bro is cooked.', corridor: "We're so back.",
  chapter: ['Chapter 1: Introduction. Rewritten.', 'Chapter 2: Literature. All of it.', 'Chapter 3: Methods. Post-chat.', 'Chapter 4: Findings. It depends.', 'Chapter 5: Discussion. Ongoing.'],
  backup: 'Missing chapters recovered from thesis_final_v26.', assembled: ['ALL CHAPTERS COMPLETED', 'HE ACTUALLY COOKED.'],
  endLines: ['Léo had climbed further than the proposal predicted.', 'Behind him: five levels, one goat and 247 tracked changes.', 'Ahead of him: the last part.'],
  endCard: ['PHASE 2 COMPLETE', 'Dissertation: Completed.', 'Sanity: Under review.'], endNext: 'Next quest: THE ĐỐC TỜ ERA',
};
Object.assign(SIGNS, {
  p2plan: 'Day 1 of fieldwork.\nThe plan is laminated.', p2bridge: 'Bridge: 60% complete.\nSince 2009.', p2goat: 'Interview in progress.', p2bus: 'Next bus: Tuesday.\nNext buffalo: now.', p2rope: 'Maximum load:\none methodology.', p2station: 'Field station.\nWi-Fi: spiritual.',
  p2doc: 'thesis_final.docx\n(Not responding)', p2cloud: 'Forecast: deadlines,\n100% chance.', p2block: 'Chapter 2\n|', p2super: 'From: Supervisor\n"Quick comments :)"', p2super2: 'From: Supervisor\n"One more small thing."', p2last: 'Word count: yes.',
});
