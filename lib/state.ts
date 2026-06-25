import { prisma } from './db';
export async function isFrozen() {
  const setting = await prisma.appSetting.findUnique({ where: { key: 'teamFormationFrozen' } });
  return setting?.value === 'true';
}
export async function setFrozen(value: boolean) {
  return prisma.appSetting.upsert({ where: { key: 'teamFormationFrozen' }, create: { key: 'teamFormationFrozen', value: String(value) }, update: { value: String(value) } });
}
export async function refreshIdeaStatus(ideaId: string) {
  const [idea, frozen] = await Promise.all([prisma.idea.findUnique({ where: { id: ideaId }, include: { members: true } }), isFrozen()]);
  if (!idea) return;
  const status = frozen ? 'frozen' : idea.members.length >= idea.maxTeamSize ? 'full' : 'open';
  await prisma.idea.update({ where: { id: ideaId }, data: { status } });
}
