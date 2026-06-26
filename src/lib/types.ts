import type { participant, idea, teamMember, interest, comment } from '../db/schema';

export type Participant = typeof participant.$inferSelect;
export type Idea = typeof idea.$inferSelect;
export type TeamMember = typeof teamMember.$inferSelect;
export type Interest = typeof interest.$inferSelect;
export type Comment = typeof comment.$inferSelect;

export type MemberWithParticipant = TeamMember & { participant: Participant };
export type InterestWithParticipant = Interest & { participant: Participant };
export type InterestWithIdea = Interest & { idea: Idea };
export type CommentWithParticipant = Comment & { participant: Participant };

export type IdeaCardData = Idea & {
  members: MemberWithParticipant[];
  interested: Interest[];
};

export type IdeaDetailData = Idea & {
  members: MemberWithParticipant[];
  interested: InterestWithParticipant[];
  comments: CommentWithParticipant[];
};

export type PersonData = Participant & {
  teamMember: (TeamMember & { idea: Idea }) | null;
  interests: InterestWithIdea[];
};
