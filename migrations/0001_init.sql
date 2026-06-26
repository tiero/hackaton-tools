-- Initial schema for the Plan ₿ hackathon team app (Cloudflare D1 / SQLite).
-- Apply locally:  pnpm run db:apply:local
-- Apply to D1:    pnpm run db:apply:remote

CREATE TABLE IF NOT EXISTS Participant (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL,
  skills      TEXT NOT NULL,
  interests   TEXT,
  contact     TEXT,
  openToJoin  INTEGER NOT NULL DEFAULT 1,
  lookingFor  TEXT,
  createdAt   TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS Idea (
  id                    TEXT PRIMARY KEY,
  title                 TEXT NOT NULL,
  problem               TEXT NOT NULL,
  proposedSolution      TEXT NOT NULL,
  neededSkills          TEXT NOT NULL,
  maxTeamSize           INTEGER NOT NULL DEFAULT 4,
  status                TEXT NOT NULL DEFAULT 'open',
  creatorParticipantId  TEXT NOT NULL,
  createdAt             TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS TeamMember (
  id             TEXT PRIMARY KEY,
  ideaId         TEXT NOT NULL REFERENCES Idea(id) ON DELETE CASCADE,
  participantId  TEXT NOT NULL REFERENCES Participant(id) ON DELETE CASCADE,
  role           TEXT NOT NULL,
  motivation     TEXT,
  createdAt      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
-- One participant can be a committed member of at most one team.
CREATE UNIQUE INDEX IF NOT EXISTS TeamMember_participantId_unique ON TeamMember(participantId);

CREATE TABLE IF NOT EXISTS Interest (
  id             TEXT PRIMARY KEY,
  ideaId         TEXT NOT NULL REFERENCES Idea(id) ON DELETE CASCADE,
  participantId  TEXT NOT NULL REFERENCES Participant(id) ON DELETE CASCADE,
  createdAt      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE UNIQUE INDEX IF NOT EXISTS Interest_ideaId_participantId_unique ON Interest(ideaId, participantId);

CREATE TABLE IF NOT EXISTS Comment (
  id             TEXT PRIMARY KEY,
  ideaId         TEXT NOT NULL REFERENCES Idea(id) ON DELETE CASCADE,
  participantId  TEXT NOT NULL REFERENCES Participant(id) ON DELETE CASCADE,
  body           TEXT NOT NULL,
  createdAt      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

CREATE TABLE IF NOT EXISTS AppSetting (
  key    TEXT PRIMARY KEY,
  value  TEXT NOT NULL
);
