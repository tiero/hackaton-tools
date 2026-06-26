export const dynamic = 'force-dynamic';
import { notFound } from 'next/navigation';
import ParticipantIdInput from '@/components/ParticipantIdInput';
import InterestButton from '@/components/InterestButton';
import { addComment, joinTeam, leaveTeam, toggleInterest } from '@/lib/actions';
import { prisma } from '@/lib/db';

const errors: Record<string, string> = {
  frozen: 'Team formation is frozen by the organizers.',
  full: 'This team is already full.',
  'already-on-team': 'You’re already committed to a team. Leave it first to join another.',
};

export default async function IdeaPage({ params, searchParams }: { params: { id: string }; searchParams: { error?: string } }) {
  const idea = await prisma.idea.findUnique({
    where: { id: params.id },
    include: {
      members: { include: { participant: true } },
      interested: { include: { participant: true } },
      comments: { include: { participant: true }, orderBy: { createdAt: 'desc' } },
    },
  });
  if (!idea) notFound();
  const isFull = idea.members.length >= idea.maxTeamSize;

  return (
    <div className="space-y-6">
      <div className="card">
        <span className="badge bg-slate-100 capitalize">{idea.status}</span>
        <h1 className="mt-3 text-3xl font-bold">{idea.title}</h1>
        <h2 className="mt-4 font-bold">Problem</h2>
        <p className="text-slate-700">{idea.problem}</p>
        <h2 className="mt-4 font-bold">Proposed solution</h2>
        <p className="text-slate-700">{idea.proposedSolution}</p>
        <p className="mt-4"><b>Needed skills:</b> {idea.neededSkills}</p>
        <p><b>Team size:</b> {idea.members.length}/{idea.maxTeamSize}{isFull && ' · full'}</p>
      </div>

      {searchParams.error && (
        <p className="card border-red-200 bg-red-50 text-red-700">{errors[searchParams.error] ?? `Could not complete action: ${searchParams.error}.`}</p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <section className="card">
          <h2 className="text-xl font-bold">Team members ({idea.members.length})</h2>
          <ul className="mt-3 space-y-2">
            {idea.members.map((m) => (
              <li key={m.id}>
                <b>{m.participant.name}</b> — {m.role}
                {m.motivation && <span className="text-slate-600"> · {m.motivation}</span>}
              </li>
            ))}
            {idea.members.length === 0 && <li className="text-slate-500">No members yet.</li>}
          </ul>
        </section>

        <section className="card">
          <h2 className="text-xl font-bold">Open to join ({idea.interested.length})</h2>
          <p className="text-sm text-slate-600">People signalling interest — not committed yet.</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {idea.interested.map((i) => (
              <li key={i.id} className="chip">{i.participant.name}</li>
            ))}
            {idea.interested.length === 0 && <li className="text-sm text-slate-500">No one yet — be the first.</li>}
          </ul>
          <div className="mt-4">
            <InterestButton ideaId={idea.id} action={toggleInterest} />
            <p className="mt-2 text-xs text-slate-500">Low-commitment signal. You can be interested in several ideas at once.</p>
          </div>
        </section>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <form action={joinTeam} className="card space-y-3">
          <h2 className="text-xl font-bold">Commit to this team</h2>
          <p className="text-sm text-slate-600">A hard commitment — you can only be on one team. This counts toward team size.</p>
          <input type="hidden" name="ideaId" value={idea.id} />
          <ParticipantIdInput />
          <label className="block">Role<input className="input mt-1" name="role" placeholder="e.g. Frontend, Protocol, Design" required /></label>
          <label className="block">Motivation<textarea className="input mt-1" name="motivation" maxLength={500} placeholder="What you can help with" /></label>
          <button className="btn" disabled={isFull}>{isFull ? 'Team full' : 'Commit to team'}</button>
        </form>

        <form action={leaveTeam} className="card space-y-3">
          <h2 className="text-xl font-bold">Leave team</h2>
          <p className="text-sm text-slate-600">You can leave unless formation is frozen.</p>
          <input type="hidden" name="ideaId" value={idea.id} />
          <ParticipantIdInput />
          <button className="btn-secondary">Leave this team</button>
        </form>
      </div>

      <form action={addComment} className="card space-y-3">
        <h2 className="text-xl font-bold">Add a comment</h2>
        <input type="hidden" name="ideaId" value={idea.id} />
        <ParticipantIdInput />
        <textarea className="input" name="body" maxLength={500} placeholder="Ask a question or offer to help…" required />
        <button className="btn">Comment</button>
      </form>

      <section className="card">
        <h2 className="text-xl font-bold">Discussion</h2>
        <div className="mt-3 space-y-3">
          {idea.comments.map((c) => (
            <p key={c.id} className="border-t pt-3">
              <b>{c.participant.name}</b> <span className="text-sm text-slate-500">{c.createdAt.toLocaleString()}</span>
              <br />
              {c.body}
            </p>
          ))}
          {idea.comments.length === 0 && <p className="text-slate-500">No comments yet.</p>}
        </div>
      </section>
    </div>
  );
}
