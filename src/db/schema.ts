import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { relations, sql } from 'drizzle-orm';

// A small id helper. D1 has no native uuid(), so ids are generated in JS.
const id = () => text('id').primaryKey();
const createdAt = () =>
  text('createdAt')
    .notNull()
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ','now'))`);

export const participant = sqliteTable('Participant', {
  id: id(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  skills: text('skills').notNull(),
  interests: text('interests'),
  contact: text('contact'),
  // Soft signal: open to join other teams even while pitching an idea.
  openToJoin: integer('openToJoin', { mode: 'boolean' }).notNull().default(true),
  lookingFor: text('lookingFor'),
  createdAt: createdAt(),
});

export const idea = sqliteTable('Idea', {
  id: id(),
  title: text('title').notNull(),
  problem: text('problem').notNull(),
  proposedSolution: text('proposedSolution').notNull(),
  neededSkills: text('neededSkills').notNull(),
  maxTeamSize: integer('maxTeamSize').notNull().default(4),
  status: text('status').notNull().default('open'), // open | full | frozen
  creatorParticipantId: text('creatorParticipantId').notNull(),
  createdAt: createdAt(),
});

// Hard commitment: a participant can be a committed member of at most one team.
export const teamMember = sqliteTable(
  'TeamMember',
  {
    id: id(),
    ideaId: text('ideaId')
      .notNull()
      .references(() => idea.id, { onDelete: 'cascade' }),
    participantId: text('participantId')
      .notNull()
      .references(() => participant.id, { onDelete: 'cascade' }),
    role: text('role').notNull(),
    motivation: text('motivation'),
    createdAt: createdAt(),
  },
  (t) => ({
    // One participant -> at most one team.
    oneTeamPerParticipant: uniqueIndex('TeamMember_participantId_unique').on(t.participantId),
  }),
);

// Soft signal: "I'm open to joining this idea" without committing.
export const interest = sqliteTable(
  'Interest',
  {
    id: id(),
    ideaId: text('ideaId')
      .notNull()
      .references(() => idea.id, { onDelete: 'cascade' }),
    participantId: text('participantId')
      .notNull()
      .references(() => participant.id, { onDelete: 'cascade' }),
    createdAt: createdAt(),
  },
  (t) => ({
    uniqInterest: uniqueIndex('Interest_ideaId_participantId_unique').on(t.ideaId, t.participantId),
  }),
);

export const comment = sqliteTable('Comment', {
  id: id(),
  ideaId: text('ideaId')
    .notNull()
    .references(() => idea.id, { onDelete: 'cascade' }),
  participantId: text('participantId')
    .notNull()
    .references(() => participant.id, { onDelete: 'cascade' }),
  body: text('body').notNull(),
  createdAt: createdAt(),
});

export const appSetting = sqliteTable('AppSetting', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
});

// --- Relations (for db.query.*.findMany({ with: ... })) ---

export const participantRelations = relations(participant, ({ many, one }) => ({
  ideas: many(idea),
  teamMember: one(teamMember, {
    fields: [participant.id],
    references: [teamMember.participantId],
  }),
  interests: many(interest),
  comments: many(comment),
}));

export const ideaRelations = relations(idea, ({ many, one }) => ({
  creator: one(participant, {
    fields: [idea.creatorParticipantId],
    references: [participant.id],
  }),
  members: many(teamMember),
  interested: many(interest),
  comments: many(comment),
}));

export const teamMemberRelations = relations(teamMember, ({ one }) => ({
  idea: one(idea, { fields: [teamMember.ideaId], references: [idea.id] }),
  participant: one(participant, {
    fields: [teamMember.participantId],
    references: [participant.id],
  }),
}));

export const interestRelations = relations(interest, ({ one }) => ({
  idea: one(idea, { fields: [interest.ideaId], references: [idea.id] }),
  participant: one(participant, {
    fields: [interest.participantId],
    references: [participant.id],
  }),
}));

export const commentRelations = relations(comment, ({ one }) => ({
  idea: one(idea, { fields: [comment.ideaId], references: [idea.id] }),
  participant: one(participant, {
    fields: [comment.participantId],
    references: [participant.id],
  }),
}));

export const schema = {
  participant,
  idea,
  teamMember,
  interest,
  comment,
  appSetting,
  participantRelations,
  ideaRelations,
  teamMemberRelations,
  interestRelations,
  commentRelations,
};
