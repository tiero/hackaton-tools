-- A few demo rows so the board isn't empty in local dev.
-- Apply locally:  pnpm run db:seed:local   (run AFTER db:apply:local)
-- Safe to re-run: uses fixed ids with INSERT OR IGNORE.

INSERT OR IGNORE INTO Participant (id, name, skills, contact) VALUES
  ('p_satoshi', 'Satoshi N.',  'Protocol, C++, cryptography', 'nostr: npub1...'),
  ('p_lina',    'Lina Ortiz',  'React, mobile, design',        'tg: @lina'),
  ('p_mateo',   'Mateo Rossi', 'Rust, Lightning, backend',     'tg: @mateo'),
  ('p_aria',    'Aria Khan',   'Go, infra, security',          'aria@example.com'),
  ('p_noah',    'Noah Weber',  'Design, product, research',    'tg: @noah');

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

-- A pre-formed team (already matched offline): public, but not accepting new members.
INSERT OR IGNORE INTO Idea (id, title, problem, proposedSolution, neededSkills, maxTeamSize, status, joinable, creatorParticipantId) VALUES
  ('i_coldcard',
   'NodeGuard — watchtower for home nodes',
   'Self-hosted Lightning nodes go offline and lose funds to outdated channel states.',
   'A lightweight watchtower + alerting setup that anyone can run alongside their node.',
   'Rust, infra, networking',
   3, 'open', 0, 'p_aria');

INSERT OR IGNORE INTO TeamMember (id, ideaId, participantId, role, motivation) VALUES
  ('tm_satoshi', 'i_seedkit',   'p_satoshi', 'Idea owner', 'Proposed this idea.'),
  ('tm_mateo',   'i_lnonboard', 'p_mateo',   'Idea owner', 'Proposed this idea.'),
  ('tm_aria',    'i_coldcard',  'p_aria',    'Idea owner', 'Proposed this idea.'),
  ('tm_noah',    'i_coldcard',  'p_noah',    'Infra',      'Already on board.');
