// Academic CV entries. `icon` is an atlas key (icon_<icon>). Later phases can append here.
export const ACHIEVEMENTS = [
  { id: 'ra', icon: 'ra', main: true, title: 'Research Assistant Unlocked', head: 'RESEARCH ASSISTANT UNLOCKED', sub: 'Delegation era begins.', note: 'Permanent. Ten seconds at a time.' },
  { id: 'margreet', icon: 'margreet', main: true, title: 'Margreet Zwarteveen Encountered', head: 'MARGREET ZWARTEVEEN ENCOUNTERED', sub: 'Water and power lore unlocked.', note: 'Reward: the Water & Power emblem.' },
  { id: 'donna', icon: 'donna', main: true, title: 'Donna Haraway Encountered', head: 'DONNA HARAWAY ENCOUNTERED', sub: 'Multispecies slay.', note: 'Reward: the Entanglement emblem.' },
  { id: 'star', icon: 'star', main: true, title: 'Susan Leigh Star Encountered', head: 'SUSAN LEIGH STAR ENCOUNTERED', sub: 'Infrastructure lore unlocked.', note: 'Reward: the Invisible Infrastructure emblem.' },
  { id: 'q1', icon: 'q1', main: true, title: 'Q1 Publication', head: 'Q1 PUBLICATION', sub: 'Academic weapon behaviour.', note: 'Léo (et al.). Accepted after 3 rounds and 1 machine.' },
  { id: 'fund', icon: 'fund', main: true, title: 'Research Funding Secured', head: 'RESEARCH FUNDING SECURED', sub: 'Financially un-cooked.', note: 'Budget line: no longer vibes.' },
  { id: 'letter', icon: 'letter', main: true, title: 'Official Fieldwork Letter Acquired', head: 'OFFICIAL FIELDWORK LETTER ACQUIRED', sub: 'Bureaucracy final boss defeated.', note: 'Công văn đã được duyệt.' },
  { id: 'delegator', icon: 'delegator', title: 'Professional Delegator', sub: 'Summoned the assistant three times.', hint: 'Delegate. Then delegate again.' },
  { id: 'caffeine', icon: 'caffeine', title: 'Caffeine Is a Methodology', sub: 'Collected 30 coffee cups.', hint: 'n = 30 cups.' },
  { id: 'rabbit', icon: 'rabbit', title: 'Research Rabbit Hole', sub: 'Found a hidden library. Lost an afternoon.', hint: 'Some books are hiding more books.' },
  { id: 'ghosted', icon: 'ghosted', title: 'Academically Ghosted', sub: 'Survived five rejection letters.', hint: 'Unfortunately... x5' },
  { id: 'uncooked', icon: 'uncooked', title: 'Financially Un-cooked', sub: 'Secured the bag. The bag is restricted funds.', hint: 'Money would help.' },
  { id: 'productive', icon: 'productive', title: 'Unexpectedly Productive', sub: 'Completed a level without losing sanity.', hint: 'Stay sane for one whole level.' },
  { id: 'buffet', icon: 'buffet', title: 'Conference Survival Skills', sub: 'Networking is temporary. Free food is forever.', hint: 'Follow the smell of free food.' },
];
export const byId = Object.fromEntries(ACHIEVEMENTS.map((a) => [a.id, a]));
export const FUTURE_SLOTS = 4;
