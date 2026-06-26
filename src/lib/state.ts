import { eq } from 'drizzle-orm';
import type { DB } from '../db';
import { appSetting, idea, teamMember } from '../db/schema';

const FROZEN_KEY = 'teamFormationFrozen';

export async function isFrozen(db: DB): Promise<boolean> {
  const row = await db.query.appSetting.findFirst({ where: eq(appSetting.key, FROZEN_KEY) });
  return row?.value === 'true';
}

export async function setFrozen(db: DB, value: boolean): Promise<void> {
  await db
    .insert(appSetting)
    .values({ key: FROZEN_KEY, value: String(value) })
    .onConflictDoUpdate({ target: appSetting.key, set: { value: String(value) } });
}

// Recompute a single idea's status from member count + global freeze.
export async function refreshIdeaStatus(db: DB, ideaId: string): Promise<void> {
  const row = await db.query.idea.findFirst({
    where: eq(idea.id, ideaId),
    with: { members: true },
  });
  if (!row) return;
  const frozen = await isFrozen(db);
  const status = frozen ? 'frozen' : row.members.length >= row.maxTeamSize ? 'full' : 'open';
  if (status !== row.status) {
    await db.update(idea).set({ status }).where(eq(idea.id, ideaId));
  }
}

// Recompute every idea (used when toggling the global freeze).
export async function refreshAllIdeas(db: DB): Promise<void> {
  const ideas = await db.select({ id: idea.id }).from(idea);
  for (const i of ideas) await refreshIdeaStatus(db, i.id);
}

export async function teamCount(db: DB, ideaId: string): Promise<number> {
  const rows = await db.select({ id: teamMember.id }).from(teamMember).where(eq(teamMember.ideaId, ideaId));
  return rows.length;
}
