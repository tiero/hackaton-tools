export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { prisma } from '@/lib/db';

export default async function People() {
  const participants = await prisma.participant.findMany({
    include: { teamMember: { include: { idea: true } }, interests_: { include: { idea: true } } },
    orderBy: [{ openToJoin: 'desc' }, { createdAt: 'desc' }],
  });
  const open = participants.filter((p) => !p.teamMember && p.openToJoin);
  const committed = participants.filter((p) => p.teamMember);
  const other = participants.filter((p) => !p.teamMember && !p.openToJoin);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">People</h1>
        <p className="mt-2 text-slate-600">Find teammates before kickoff. Anyone marked <b>open to join</b> is looking for a team.</p>
        <Link className="btn mt-4" href="/join">Register / Edit My Profile</Link>
      </div>

      <Section title={`Open to join (${open.length})`} subtitle="Not committed yet — recruit them or reach out.">
        {open.map((p) => <PersonCard key={p.id} p={p} />)}
        {open.length === 0 && <p className="card text-slate-600">Nobody in the open pool yet.</p>}
      </Section>

      <Section title={`Committed to a team (${committed.length})`} subtitle="Already on a team — some may still be open to swap before freeze.">
        {committed.map((p) => <PersonCard key={p.id} p={p} />)}
        {committed.length === 0 && <p className="card text-slate-600">No committed members yet.</p>}
      </Section>

      {other.length > 0 && (
        <Section title={`Registered, not currently looking (${other.length})`} subtitle="">
          {other.map((p) => <PersonCard key={p.id} p={p} />)}
        </Section>
      )}
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-2xl font-bold">{title}</h2>
      {subtitle && <p className="text-sm text-slate-600">{subtitle}</p>}
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </section>
  );
}

function PersonCard({ p }: { p: any }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between gap-2">
        <p className="font-semibold">{p.name}</p>
        {p.openToJoin && !p.teamMember && <span className="badge bg-green-100 text-green-800">Open</span>}
        {p.teamMember && <span className="badge bg-slate-200 text-slate-700">On a team</span>}
      </div>
      <p className="mt-1 text-sm text-slate-600">{p.skills}</p>
      {p.lookingFor && <p className="mt-2 text-sm text-slate-500">“{p.lookingFor}”</p>}
      {p.teamMember && <p className="mt-2 text-xs text-slate-500">Team: <b>{p.teamMember.idea.title}</b> · {p.teamMember.role}</p>}
      {p.interests_.length > 0 && (
        <p className="mt-2 text-xs text-slate-500">Interested in: {p.interests_.map((i: any) => i.idea.title).join(', ')}</p>
      )}
      {p.contact && <p className="mt-2 text-xs text-slate-400">{p.contact}</p>}
    </div>
  );
}
