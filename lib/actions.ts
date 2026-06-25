'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from './db';
import { email, intRange, optional, required } from './validation';
import { isFrozen, refreshIdeaStatus, setFrozen } from './state';

export async function saveParticipant(_: unknown, formData: FormData) {
  try {
    const id = optional(formData.get('id'), 100);
    const data = { name: required(formData.get('name'), 'Name', 120), email: email(formData.get('email')), skills: required(formData.get('skills'), 'Skills', 1000), interests: optional(formData.get('interests'), 1000), contact: optional(formData.get('contact'), 1000) };
    const participant = id ? await prisma.participant.update({ where: { id }, data }) : await prisma.participant.create({ data });
    revalidatePath('/');
    return { ok: true, id: participant.id, message: 'Profile saved.' };
  } catch (e) { return { ok: false, message: e instanceof Error ? e.message : 'Could not save profile.' }; }
}

export async function createIdea(formData: FormData) {
  const participantId = required(formData.get('participantId'), 'Participant');
  if (await isFrozen()) redirect('/ideas/new?error=frozen');
  const count = await prisma.idea.count();
  if (count >= 8) redirect('/ideas/new?error=max');
  const title = required(formData.get('title'), 'Idea title', 160);
  const maxTeamSize = intRange(formData.get('maxTeamSize'), 'Max team size', 2, 6, 4);
  const idea = await prisma.idea.create({ data: { title, problem: required(formData.get('problem'), 'Problem', 2000), proposedSolution: required(formData.get('proposedSolution'), 'Proposed solution', 2000), neededSkills: required(formData.get('neededSkills'), 'Needed skills', 1000), maxTeamSize, creatorParticipantId: participantId, members: { create: { participantId, role: 'Idea owner', motivation: 'Proposed this idea.' } } } });
  await refreshIdeaStatus(idea.id);
  revalidatePath('/');
  redirect(`/ideas/${idea.id}`);
}

export async function joinTeam(formData: FormData) {
  const ideaId = required(formData.get('ideaId'), 'Idea');
  const participantId = required(formData.get('participantId'), 'Participant');
  if (await isFrozen()) redirect(`/ideas/${ideaId}?error=frozen`);
  const idea = await prisma.idea.findUnique({ where: { id: ideaId }, include: { members: true } });
  if (!idea || idea.members.length >= idea.maxTeamSize) redirect(`/ideas/${ideaId}?error=full`);
  try { await prisma.teamMember.create({ data: { ideaId, participantId, role: required(formData.get('role'), 'Role', 120), motivation: optional(formData.get('motivation'), 500) } }); }
  catch { redirect(`/ideas/${ideaId}?error=already-on-team`); }
  await refreshIdeaStatus(ideaId); revalidatePath('/'); redirect(`/ideas/${ideaId}`);
}

export async function leaveTeam(formData: FormData) {
  const participantId = required(formData.get('participantId'), 'Participant');
  const ideaId = required(formData.get('ideaId'), 'Idea');
  if (await isFrozen()) redirect(`/ideas/${ideaId}?error=frozen`);
  await prisma.teamMember.deleteMany({ where: { participantId, ideaId } });
  await refreshIdeaStatus(ideaId); revalidatePath('/'); redirect(`/ideas/${ideaId}`);
}

export async function addComment(formData: FormData) {
  const ideaId = required(formData.get('ideaId'), 'Idea');
  await prisma.comment.create({ data: { ideaId, participantId: required(formData.get('participantId'), 'Participant'), body: required(formData.get('body'), 'Comment', 500) } });
  revalidatePath(`/ideas/${ideaId}`); redirect(`/ideas/${ideaId}`);
}

export async function adminAction(formData: FormData) {
  if (String(formData.get('password') ?? '') !== process.env.ADMIN_PASSWORD) redirect('/admin?error=bad-password');
  const action = String(formData.get('action'));
  if (action === 'freeze' || action === 'unfreeze') { await setFrozen(action === 'freeze'); const ideas = await prisma.idea.findMany(); await Promise.all(ideas.map(i => refreshIdeaStatus(i.id))); }
  if (action === 'deleteIdea') await prisma.idea.delete({ where: { id: required(formData.get('ideaId'), 'Idea') } });
  if (action === 'removeMember') { const member = await prisma.teamMember.delete({ where: { id: required(formData.get('memberId'), 'Member') } }); await refreshIdeaStatus(member.ideaId); }
  revalidatePath('/admin'); revalidatePath('/'); redirect(`/admin?password=${encodeURIComponent(String(formData.get('password')))}`);
}
