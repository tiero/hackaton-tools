export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { EVENT } from '@/lib/event';

const statusStyle: Record<string, string> = {
  open: 'bg-green-100 text-green-800',
  full: 'bg-slate-200 text-slate-700',
  frozen: 'bg-blue-100 text-blue-800',
};

export default async function Home() {
  const [ideas, openPeople] = await Promise.all([
    prisma.idea.findMany({
      include: { members: { include: { participant: true } }, _count: { select: { interested: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.participant.findMany({
      where: { openToJoin: true, teamMember: null },
      orderBy: { createdAt: 'desc' },
      take: 8,
    }),
  ]);

  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-gradient-to-br from-orange-600 to-amber-500 p-8 text-white">
        <p className="text-sm font-semibold uppercase tracking-wide text-orange-100">{EVENT.dates} · {EVENT.location}</p>
        <h1 className="mt-2 text-4xl font-bold">{EVENT.name}</h1>
        <p className="mt-3 max-w-2xl text-orange-50">{EVENT.themeBlurb}</p>
        <p className="mt-3 max-w-2xl rounded-xl bg-black/15 p-3 text-sm text-amber-50">⚠ {EVENT.hardGate}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link className="btn bg-white text-orange-700 hover:bg-orange-50" href="/join">Register / Edit My Profile</Link>
          <Link className="btn bg-slate-900 hover:bg-slate-800" href="/ideas/new">Pitch an Idea</Link>
          <Link className="btn-secondary bg-transparent text-white hover:bg-white/10" href="/people">Find teammates</Link>
        </div>
        <p className="mt-4 text-sm text-orange-100">
          Pitch an idea to lead a team — and still mark yourself <b>open to join</b> other ideas. Nothing is final until organizers freeze formation at kickoff.
        </p>
      </section>

      <section>
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-bold">Ideas ({ideas.length}/{EVENT.maxTeams})</h2>
          <Link className="text-sm font-semibold text-orange-700 hover:underline" href="/ideas/new">+ Pitch an idea</Link>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {ideas.map((idea) => (
            <article className="card flex flex-col" key={idea.id}>
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-xl font-bold">{idea.title}</h3>
                <span className={`badge capitalize ${statusStyle[idea.status] ?? 'bg-slate-100'}`}>{idea.status}</span>
              </div>
              <p className="mt-2 line-clamp-3 text-slate-700">{idea.problem}</p>
              <p className="mt-3 text-sm"><b>Needs:</b> {idea.neededSkills}</p>
              <p className="mt-1 text-sm text-slate-600">
                <b>Team:</b> {idea.members.length}/{idea.maxTeamSize}
                {idea._count.interested > 0 && <span> · {idea._count.interested} interested 👋</span>}
              </p>
              <p className="mt-1 text-sm text-slate-500">{idea.members.map((m) => m.participant.name).join(', ') || 'No members yet'}</p>
              <Link className="btn-secondary mt-4 self-start" href={`/ideas/${idea.id}`}>View details</Link>
            </article>
          ))}
          {ideas.length === 0 && <p className="card text-slate-600">No ideas yet. Be the first to pitch one.</p>}
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-bold">Open to join ({openPeople.length})</h2>
          <Link className="text-sm font-semibold text-orange-700 hover:underline" href="/people">See everyone →</Link>
        </div>
        <p className="mt-1 text-sm text-slate-600">People who registered, aren’t committed to a team yet, and are open to join. Recruit them.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {openPeople.map((p) => (
            <div className="card" key={p.id}>
              <p className="font-semibold">{p.name}</p>
              <p className="mt-1 text-sm text-slate-600">{p.skills}</p>
              {p.lookingFor && <p className="mt-2 text-sm text-slate-500">“{p.lookingFor}”</p>}
            </div>
          ))}
          {openPeople.length === 0 && <p className="card text-slate-600">Nobody’s in the open pool yet.</p>}
        </div>
      </section>
    </div>
  );
}
