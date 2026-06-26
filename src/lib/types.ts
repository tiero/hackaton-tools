import type { participant, idea, teamMember } from '../db/schema';

export type Participant = typeof participant.$inferSelect;
export type Idea = typeof idea.$inferSelect;
export type TeamMember = typeof teamMember.$inferSelect;

export type MemberWithParticipant = TeamMember & { participant: Participant };

export type IdeaCardData = Idea & {
  members: MemberWithParticipant[];
};

export type IdeaDetailData = Idea & {
  members: MemberWithParticipant[];
};

export type PersonData = Participant & {
  teamMember: (TeamMember & { idea: Idea }) | null;
};
