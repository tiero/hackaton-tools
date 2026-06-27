// Single source of truth for Plan ₿ Summer School Hackathon event details.
// Edit here to re-theme the whole app.

export const EVENT = {
  name: 'Plan ₿ Summer School Hackathon',
  dates: 'Monday 29 – Tuesday 30 June 2026',
  location: 'P. Gregory Warden Student Center, Franklin University, Lugano',
  format: '8 teams · single track · ~30 hours, overnight',
  theme: 'Bitcoin infrastructure for the next billion — with a Plan ₿ mindset',
  maxTeams: 8,
  defaultTeamSize: 4,
};

export const JUDGING = [
  { criterion: 'Bitcoin relevance', weight: '30%', note: 'Protocol-level thinking. Uses Bitcoin’s properties directly. Self-sovereign by design.' },
  { criterion: 'Presentation quality', weight: '25%', note: 'Clear what was built, why, and what’s next. Did the pitch land?' },
  { criterion: 'Technical execution', weight: '20%', note: 'Working demo over slideware. Non-custodial architecture is real, not claimed.' },
  { criterion: 'Innovation / ambition', weight: '15%', note: 'Scopes for impact under constraint. Builds for the hostile-regime scenario.' },
  { criterion: 'Teamwork', weight: '10%', note: 'How the team worked together over 30 hours (mentor observation).' },
];

export const MENTORS: { name: string; role: string }[] = [
  { name: 'Raheem', role: 'Legal' },
  { name: 'Mir', role: 'Communication' },
  { name: 'Orange', role: 'Tech' },
  { name: 'JW', role: 'Finance' },
  { name: 'Kevin', role: 'Tech' },
];

export const JUDGES = ['Tiero', 'Giacomo', 'Anna', 'Efrat'];

export const TEAM_RULES = [
  'Minimum 3 students per team',
  'At least one technical and one business profile required',
  'Maximum 4 students per team',
  'No recycling of existing projects',
];

export const PRIZES = [
  { place: '1st', prize: 'Cyphertank' },
  { place: '2nd', prize: 'Jade Plus + Arkade Advisory Business and Tech Integration' },
  { place: '3rd', prize: 'Mempool Space Enterprise Plan' },
];

export type ScheduleItem = { time: string; what: string; where?: string; kind: 'hack' | 'break' | 'social' | 'talk' };

export const SCHEDULE: { day: string; items: ScheduleItem[] }[] = [
  {
    day: 'Sunday 28 June (remote)',
    items: [
      { time: 'Online', what: 'Team formation on your own — pitch ideas and form your squad on this site', kind: 'talk' },
    ],
  },
  {
    day: 'Monday 29 June',
    items: [
      { time: '10:00', what: 'Kickoff — welcome & greetings (Tiero), rules, non-custodial hard gate, team confirmation (room opens 10:00)', where: 'Warden Student Center', kind: 'talk' },
      { time: '11:00', what: 'Hacking begins — heads down; mentors on hand to help', where: 'Warden Student Center', kind: 'hack' },
      { time: '13:00–14:00', what: 'Lunch on your own (room stays open)', where: 'Franklin Grotto', kind: 'break' },
      { time: '14:00', what: 'Hacking continues — afternoon sprint, mentors roaming to help', where: 'Warden Student Center', kind: 'hack' },
      { time: '~19:00', what: 'Dinner on your own', where: 'Franklin Grotto', kind: 'social' },
      { time: '~20:00', what: 'Overnight hacking — room open all night (no mentor guaranteed)', where: 'Warden Student Center', kind: 'hack' },
    ],
  },
  {
    day: 'Tuesday 30 June',
    items: [
      { time: '09:00', what: 'Morning push — keep building, mentors on hand', where: 'Warden Student Center', kind: 'hack' },
      { time: '12:30', what: 'Grab-and-go lunch — keep hacking', where: 'Franklin Grotto', kind: 'break' },
      { time: '14:00', what: 'Hacking ends — hard stop, everyone clears the room', where: 'Warden Student Center', kind: 'hack' },
      { time: '14:00–14:30', what: 'Judges setup — same room cleared for ~30 min (nobody inside)', where: 'Warden Student Center', kind: 'talk' },
      { time: '14:30', what: 'Pitches & feedback — 8 teams × 12 min (7 demo + 5 Q&A)', where: 'Warden Student Center', kind: 'talk' },
      { time: '16:15', what: 'Jury deliberation (private)', where: 'Warden Student Center', kind: 'talk' },
      { time: '16:45', what: 'Awards & closing feedback (room until 18:00)', where: 'Warden Student Center', kind: 'social' },
      { time: '~19:00', what: 'Dinner at Lugano Dante', kind: 'social' },
    ],
  },
];
