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
  skills: text('skills').notNull(),
  contact: text('contact'),
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
  // false = pre-formed team, not accepting new members (still public).
  joinable: integer('joinable', { mode: 'boolean' }).notNull().default(true),
  creatorParticipantId: text('creatorParticipantId').notNull(),
  createdAt: createdAt(),
});

// A participant can be a committed member of at most one team.
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
  comments: many(comment),
}));

export const ideaRelations = relations(idea, ({ many, one }) => ({
  creator: one(participant, {
    fields: [idea.creatorParticipantId],
    references: [participant.id],
  }),
  members: many(teamMember),
  comments: many(comment),
}));

export const teamMemberRelations = relations(teamMember, ({ one }) => ({
  idea: one(idea, { fields: [teamMember.ideaId], references: [idea.id] }),
  participant: one(participant, {
    fields: [teamMember.participantId],
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
  comment,
  appSetting,
  participantRelations,
  ideaRelations,
  teamMemberRelations,
  commentRelations,
};
