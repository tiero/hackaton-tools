import ParticipantIdInput from '@/components/ParticipantIdInput';
import { createIdea } from '@/lib/actions';
import { EVENT } from '@/lib/event';
export default function NewIdea({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-3xl font-bold">Pitch an idea</h1>
      <p className="text-slate-600">
        Pitching makes you the idea owner and starts a team. You’ll still be able to mark yourself open to join other ideas — pitching isn’t a lock-in.
      </p>
      <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">⚠ {EVENT.hardGate}</p>
      {searchParams.error === 'max' && <p className="card text-red-700">The maximum of {EVENT.maxTeams} teams has been reached. Please join an existing team.</p>}
      {searchParams.error === 'frozen' && <p className="card text-red-700">Team formation is frozen.</p>}
      <form action={createIdea} className="card space-y-4">
        <ParticipantIdInput />
        <label className="block">Title<input className="input mt-1" name="title" placeholder="Short, memorable" required /></label>
        <label className="block">Problem<textarea className="input mt-1" name="problem" placeholder="Who can’t access Bitcoin today, and why it matters" required /></label>
        <label className="block">Proposed solution<textarea className="input mt-1" name="proposedSolution" placeholder="How you’d build it — non-custodial by design" required /></label>
        <label className="block">Needed skills<textarea className="input mt-1" name="neededSkills" placeholder="e.g. Lightning, Rust, mobile, design" required /></label>
        <label className="block">Max team size<input className="input mt-1" name="maxTeamSize" type="number" min="2" max="6" defaultValue="4" required /></label>
        <button className="btn">Pitch idea</button>
      </form>
    </div>
  );
}
