export const dynamic = 'force-dynamic';
import { adminAction, adminLogout, isAdmin } from '@/lib/actions';
import { prisma } from '@/lib/db';
import { isFrozen } from '@/lib/state';
import AdminLogin from '@/components/AdminLogin';

export default async function Admin() {
  if (!(await isAdmin())) {
    return (
      <div className="max-w-md">
        <h1 className="mb-4 text-3xl font-bold">Admin</h1>
        <AdminLogin />
      </div>
    );
  }
  const [ideas, participants, frozen] = await Promise.all([
    prisma.idea.findMany({ include: { members: { include: { participant: true } }, _count: { select: { interested: true } } } }),
    prisma.participant.findMany({ include: { teamMember: { include: { idea: true } } }, orderBy: { createdAt: 'desc' } }),
    isFrozen(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin</h1>
        <form action={adminLogout}><button className="text-sm text-slate-500 hover:underline">Log out</button></form>
      </div>

      <div className="card flex flex-wrap gap-3">
        <form action={adminAction}>
          <input type="hidden" name="action" value={frozen ? 'unfreeze' : 'freeze'} />
          <button className="btn">{frozen ? 'Unfreeze' : 'Freeze'} team formation</button>
        </form>
        <a className="btn-secondary" href="/admin/export/teams">Export teams CSV</a>
        <a className="btn-secondary" href="/admin/export/participants">Export participants CSV</a>
        <span className="self-center text-sm text-slate-500">Status: {frozen ? 'frozen 🔒' : 'open'}</span>
      </div>

      <section className="card">
        <h2 className="text-xl font-bold">Teams / ideas ({ideas.length})</h2>
        {ideas.map((i) => (
          <div className="mt-4 border-t pt-4" key={i.id}>
            <div className="flex items-center gap-3">
              <b>{i.title}</b>
              <span className="text-sm text-slate-500">{i.members.length}/{i.maxTeamSize} · {i._count.interested} interested</span>
              <form action={adminAction} className="inline">
                <input type="hidden" name="action" value="deleteIdea" />
                <input type="hidden" name="ideaId" value={i.id} />
                <button className="ml-auto text-sm text-red-700 hover:underline">Delete idea</button>
              </form>
            </div>
            <ul className="mt-2 space-y-1">
              {i.members.map((m) => (
                <li key={m.id} className="text-sm">
                  {m.participant.name} — {m.role}
                  <form action={adminAction} className="inline">
                    <input type="hidden" name="action" value="removeMember" />
                    <input type="hidden" name="memberId" value={m.id} />
                    <button className="ml-2 text-red-700 hover:underline">Remove</button>
                  </form>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <section className="card">
        <h2 className="text-xl font-bold">Participants ({participants.length})</h2>
        <ul className="mt-3 space-y-1 text-sm">
          {participants.map((p) => (
            <li key={p.id}>
              {p.name} · {p.email} · {p.teamMember?.idea.title ?? 'No team'}{p.openToJoin && !p.teamMember ? ' · open to join' : ''}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
