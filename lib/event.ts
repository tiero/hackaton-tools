// Single source of truth for Plan ₿ Summer School Hackathon event details.
// Edit here to re-theme the whole app.

export const EVENT = {
  name: 'Plan ₿ Summer School Hackathon',
  dates: 'Monday 29 – Tuesday 30 June 2026',
  location: 'P. Gregory Warden Student Center, Franklin University, Lugano',
  format: '8 teams · single track · ~30 hours, overnight',
  theme: 'Bitcoin infrastructure for the next billion — with a Plan ₿ mindset',
  themeBlurb:
    'Build infrastructure that brings Bitcoin to people who don’t have it yet, and make it survive hostile conditions. Wallets, privacy tooling, L2 interfaces, identity primitives, onboarding flows, education tools. Protocol-level thinking, not UI wrappers on custodial APIs.',
  hardGate:
    'Non-custodial is a hard gate. If your project holds user keys, it’s disqualified. Self-sovereign or nothing — the user controls their money at every step.',
  maxTeams: 8,
};

export const JUDGING = [
  { criterion: 'Bitcoin relevance', weight: '30%', note: 'Protocol-level thinking. Uses Bitcoin’s properties directly. Self-sovereign by design.' },
  { criterion: 'Presentation quality', weight: '25%', note: 'Clear what was built, why, and what’s next. Did the pitch land?' },
  { criterion: 'Technical execution', weight: '20%', note: 'Working demo over slideware. Non-custodial architecture is real, not claimed.' },
  { criterion: 'Innovation / ambition', weight: '15%', note: 'Scopes for impact under constraint. Builds for the hostile-regime scenario.' },
  { criterion: 'Teamwork', weight: '10%', note: 'How the team worked together over 30 hours (mentor observation).' },
];

export const MENTORS = [
  'Tiero',
  'Efrat Fenigson',
  'Wiz',
  'OrangeSurf',
  'Rahim Taghizadegan',
];

export const PRIZES = [
  { place: '1st', prize: 'Cyphertank access (1 slot)' },
  { place: '2nd', prize: 'BitBox hardware wallet' },
  { place: '3rd', prize: 'Ark Labs support and business advisory' },
];

export type ScheduleItem = { time: string; what: string; where?: string; kind: 'hack' | 'break' | 'social' | 'talk' };

export const SCHEDULE: { day: string; items: ScheduleItem[] }[] = [
  {
    day: 'Monday 29 June',
    items: [
      { time: '10:00', what: 'Kickoff — welcome, rules, non-custodial hard gate, challenge brief', where: 'Warden Student Center', kind: 'hack' },
      { time: '10:10', what: 'Idea pitches — anyone can pitch, 60s each', where: 'Warden Student Center', kind: 'talk' },
      { time: '10:35', what: 'Voting + team formation — top ~8 ideas become projects', where: 'Warden Student Center', kind: 'talk' },
      { time: '10:45', what: 'Efrat — “How to pitch like it matters”', where: 'Warden Student Center', kind: 'talk' },
      { time: '11:15', what: 'Technical session — “Building for the next billion”', where: 'Warden Student Center', kind: 'talk' },
      { time: '11:45', what: 'Hacking begins', where: 'Warden Student Center', kind: 'hack' },
      { time: '13:00–14:00', what: 'Lunch on your own (room stays open)', where: 'Franklin Grotto', kind: 'break' },
      { time: '14:00', what: 'Hacking continues — afternoon sprint', where: 'Warden Student Center', kind: 'hack' },
      { time: '~19:00', what: 'Dinner on your own', where: 'Franklin Grotto', kind: 'social' },
      { time: '~20:00', what: 'Overnight hacking — room open all night, ≥1 mentor present', where: 'Warden Student Center', kind: 'hack' },
    ],
  },
  {
    day: 'Tuesday 30 June',
    items: [
      { time: '09:00', what: 'Morning push — final hacking hours', where: 'Warden Student Center', kind: 'hack' },
      { time: '12:00', what: 'Hacking ends — hard stop, prep presentations', where: 'Warden Student Center', kind: 'hack' },
      { time: '12:40–14:00', what: 'Lunch on your own (room open for prep)', where: 'Franklin Grotto', kind: 'break' },
      { time: '14:15', what: 'Presentations begin — 8 teams × 12 min (7 demo + 5 Q&A)', where: 'Classroom', kind: 'talk' },
      { time: '16:00', what: 'Jury deliberation (private)', kind: 'talk' },
      { time: '16:30', what: 'Awards ceremony', where: 'Classroom', kind: 'social' },
      { time: '~19:00', what: 'Dinner at Lugano Dante', kind: 'social' },
    ],
  },
];
