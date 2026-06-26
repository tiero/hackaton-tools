'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { prisma } from './db';
import { email, intRange, optional, required, boolean } from './validation';
import { isFrozen, refreshIdeaStatus, setFrozen } from './state';
import { EVENT } from './event';

export async function saveParticipant(_: unknown, formData: FormData) {
  try {
    const id = optional(formData.get('id'), 100);
    const data = {
      name: required(formData.get('name'), 'Name', 120),
      email: email(formData.get('email')),
      skills: required(formData.get('skills'), 'Skills', 1000),
      interests: optional(formData.get('interests'), 1000),
      contact: optional(formData.get('contact'), 1000),
      lookingFor: optional(formData.get('lookingFor'), 1000),
      openToJoin: boolean(formData.get('openToJoin')),
    };
    const participant = id
      ? await prisma.participant.update({ where: { id }, data })
      : await prisma.participant.create({ data });
    revalidatePath('/');
    revalidatePath('/people');
    return { ok: true, id: participant.id, message: 'Profile saved.' };
  } catch (e) {
    return { ok: false, id: '', message: e instanceof Error ? e.message : 'Could not save profile.' };
  }
}

export async function createIdea(formData: FormData) {
  const participantId = required(formData.get('participantId'), 'Participant');
  if (await isFrozen()) redirect('/ideas/new?error=frozen');
  const count = await prisma.idea.count();
  if (count >= EVENT.maxTeams) redirect('/ideas/new?error=max');
  const title = required(formData.get('title'), 'Idea title', 160);
  const maxTeamSize = intRange(formData.get('maxTeamSize'), 'Max team size', 2, 6, 4);
  const idea = await prisma.idea.create({
    data: {
      title,
      problem: required(formData.get('problem'), 'Problem', 2000),
      proposedSolution: required(formData.get('proposedSolution'), 'Proposed solution', 2000),
      neededSkills: required(formData.get('neededSkills'), 'Needed skills', 1000),
      maxTeamSize,
      creatorParticipantId: participantId,
      members: { create: { participantId, role: 'Idea owner', motivation: 'Proposed this idea.' } },
    },
  });
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
  try {
    await prisma.teamMember.create({
      data: {
        ideaId,
        participantId,
        role: required(formData.get('role'), 'Role', 120),
        motivation: optional(formData.get('motivation'), 500),
      },
    });
  } catch {
    redirect(`/ideas/${ideaId}?error=already-on-team`);
  }
  // Committing to a team clears your soft interest in it (it's now a hard commit).
  await prisma.interest.deleteMany({ where: { ideaId, participantId } });
  await refreshIdeaStatus(ideaId);
  revalidatePath('/');
  revalidatePath('/people');
  redirect(`/ideas/${ideaId}`);
}

export async function leaveTeam(formData: FormData) {
  const participantId = required(formData.get('participantId'), 'Participant');
  const ideaId = required(formData.get('ideaId'), 'Idea');
  if (await isFrozen()) redirect(`/ideas/${ideaId}?error=frozen`);
  await prisma.teamMember.deleteMany({ where: { participantId, ideaId } });
  await refreshIdeaStatus(ideaId);
  revalidatePath('/');
  revalidatePath('/people');
  redirect(`/ideas/${ideaId}`);
}

// Soft signal: toggle "I'm open to joining this idea" without committing.
export async function toggleInterest(formData: FormData) {
  const ideaId = required(formData.get('ideaId'), 'Idea');
  const participantId = required(formData.get('participantId'), 'Participant');
  const existing = await prisma.interest.findUnique({
    where: { ideaId_participantId: { ideaId, participantId } },
  });
  if (existing) {
    await prisma.interest.delete({ where: { id: existing.id } });
  } else {
    await prisma.interest.create({ data: { ideaId, participantId } });
  }
  revalidatePath(`/ideas/${ideaId}`);
  revalidatePath('/');
  redirect(`/ideas/${ideaId}`);
}

export async function addComment(formData: FormData) {
  const ideaId = required(formData.get('ideaId'), 'Idea');
  await prisma.comment.create({
    data: {
      ideaId,
      participantId: required(formData.get('participantId'), 'Participant'),
      body: required(formData.get('body'), 'Comment', 500),
    },
  });
  revalidatePath(`/ideas/${ideaId}`);
  redirect(`/ideas/${ideaId}`);
}

// --- Admin: cookie-based session so the password never rides in the URL. ---

const ADMIN_COOKIE = 'admin_ok';

export async function adminLogin(_: unknown, formData: FormData) {
  const password = String(formData.get('password') ?? '');
  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    return { ok: false, message: 'Incorrect password.' };
  }
  cookies().set(ADMIN_COOKIE, process.env.ADMIN_PASSWORD, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8,
  });
  redirect('/admin');
}

export async function adminLogout() {
  cookies().delete(ADMIN_COOKIE);
  redirect('/admin');
}

export async function isAdmin() {
  const c = cookies().get(ADMIN_COOKIE)?.value;
  return Boolean(process.env.ADMIN_PASSWORD) && c === process.env.ADMIN_PASSWORD;
}

export async function adminAction(formData: FormData) {
  if (!(await isAdmin())) redirect('/admin');
  const action = String(formData.get('action'));
  if (action === 'freeze' || action === 'unfreeze') {
    await setFrozen(action === 'freeze');
    const ideas = await prisma.idea.findMany();
    await Promise.all(ideas.map((i) => refreshIdeaStatus(i.id)));
  }
  if (action === 'deleteIdea') await prisma.idea.delete({ where: { id: required(formData.get('ideaId'), 'Idea') } });
  if (action === 'removeMember') {
    const member = await prisma.teamMember.delete({ where: { id: required(formData.get('memberId'), 'Member') } });
    await refreshIdeaStatus(member.ideaId);
  }
  revalidatePath('/admin');
  revalidatePath('/');
  redirect('/admin');
}
