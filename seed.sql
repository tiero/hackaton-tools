-- A few demo rows so the board isn't empty in local dev.
-- Apply locally:  pnpm run db:seed:local   (run AFTER db:apply:local)
-- Safe to re-run: uses fixed ids with INSERT OR IGNORE.

INSERT OR IGNORE INTO Participant (id, name, email, skills, interests, contact, openToJoin, lookingFor) VALUES
  ('p_satoshi', 'Satoshi N.',  'satoshi@example.com', 'Protocol, C++, cryptography', 'Privacy, sound money', 'nostr: npub1...', 0, NULL),
  ('p_lina',    'Lina Ortiz',  'lina@example.com',    'React, mobile, design',        'Onboarding, UX',     'tg: @lina',      1, 'A team building a non-custodial wallet'),
  ('p_mateo',   'Mateo Rossi', 'mateo@example.com',   'Rust, Lightning, backend',     'L2, payments',       'tg: @mateo',     1, 'Lightning infra to hack on'),
  ('p_aria',    'Aria Khan',   'aria@example.com',    'Go, infra, security',          'Self-custody, nodes','aria@example.com',1, 'Anything non-custodial'),
  ('p_noah',    'Noah Weber',  'noah@example.com',    'Design, product, research',    'Education',          'tg: @noah',      1, 'A team that needs a designer');

INSERT OR IGNORE INTO Idea (id, title, problem, proposedSolution, neededSkills, maxTeamSize, status, creatorParticipantId) VALUES
  ('i_seedkit',
   'SeedKit — resilient key backup',
   'New Bitcoiners lose funds because seed backup is scary and fragile, especially under hostile conditions.',
   'A non-custodial, offline-first backup flow using SLIP-39 shares with a friendly mobile UX. Keys never leave the device.',
   'Mobile, cryptography, UX',
   4, 'open', 'p_satoshi'),
  ('i_lnonboard',
   'OrangePay — Lightning onboarding for shops',
   'Small merchants in cash economies can''t easily accept Bitcoin without custodians.',
   'A self-custodial Lightning point-of-sale that runs on a cheap Android phone, with a guided setup.',
   'Lightning, mobile, backend',
   4, 'open', 'p_mateo');

INSERT OR IGNORE INTO TeamMember (id, ideaId, participantId, role, motivation) VALUES
  ('tm_satoshi', 'i_seedkit',   'p_satoshi', 'Idea owner', 'Proposed this idea.'),
  ('tm_mateo',   'i_lnonboard', 'p_mateo',   'Idea owner', 'Proposed this idea.');

INSERT OR IGNORE INTO Interest (id, ideaId, participantId) VALUES
  ('int_lina_seed',  'i_seedkit',   'p_lina'),
  ('int_aria_seed',  'i_seedkit',   'p_aria'),
  ('int_noah_ln',    'i_lnonboard', 'p_noah');

INSERT OR IGNORE INTO Comment (id, ideaId, participantId, body) VALUES
  ('cm_1', 'i_seedkit', 'p_lina', 'Love this — I can take the mobile UX. What''s the target OS?');
