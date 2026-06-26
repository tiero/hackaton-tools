import type { FC } from 'hono/jsx';
import { StatusBadge } from './layout';
import { EVENT, JUDGING, MENTORS, PRIZES, SCHEDULE } from '../lib/event';
import type {
  IdeaCardData,
  IdeaDetailData,
  Participant,
  PersonData,
} from '../lib/types';

const errorText: Record<string, string> = {
  frozen: 'Team formation is frozen by the organizers.',
  full: 'This team is already full.',
  'already-on-team': 'You’re already committed to a team. Leave it first to join another.',
  max: `The maximum of ${EVENT.maxTeams} teams has been reached. Join an existing idea instead.`,
  'need-profile': 'Register a profile first, then you can pitch or join.',
  notfound: 'That item could not be found.',
};

export function flashFrom(query: { error?: string; ok?: string }): { kind: 'error' | 'ok'; message: string } | null {
  if (query.error) return { kind: 'error', message: errorText[query.error] ?? query.error };
  if (query.ok) return { kind: 'ok', message: query.ok };
  return null;
}

// ---------- Home / board ----------

export const Home: FC<{ ideas: IdeaCardData[]; openPeople: Participant[] }> = ({ ideas, openPeople }) => (
  <div class="space-y-10">
    <section class="rounded-3xl bg-gradient-to-br from-bitcoin-600 to-amber-500 p-8 text-white">
      <p class="text-sm font-semibold uppercase tracking-wide text-orange-100">
        {EVENT.dates} · Lugano
      </p>
      <h1 class="mt-2 text-3xl font-bold sm:text-4xl">{EVENT.name}</h1>
      <p class="mt-3 max-w-2xl text-orange-50">{EVENT.themeBlurb}</p>
      <p class="mt-3 max-w-2xl rounded-xl bg-black/15 p-3 text-sm text-amber-50">⚠ {EVENT.hardGate}</p>
      <div class="mt-6 flex flex-wrap gap-3">
        <a class="btn bg-white text-bitcoin-700 hover:bg-orange-50" href="/join">Register / Edit My Profile</a>
        <a class="btn bg-slate-900 hover:bg-slate-800" href="/ideas/new">Pitch an Idea</a>
        <a class="btn-secondary bg-transparent text-white hover:bg-white/10" href="/people">Find teammates</a>
      </div>
      <p class="mt-4 text-sm text-orange-100">
        Pitch an idea to lead a team — and still mark yourself <b>open to join</b> other ideas. Nothing is final
        until organizers freeze formation at kickoff.
      </p>
    </section>

    <section>
      <div class="flex items-end justify-between">
        <h2 class="text-2xl font-bold">
          Ideas ({ideas.length}/{EVENT.maxTeams})
        </h2>
        <a class="text-sm font-semibold text-bitcoin-700 hover:underline" href="/ideas/new">+ Pitch an idea</a>
      </div>
      <div class="mt-4 grid gap-4 md:grid-cols-2">
        {ideas.map((idea) => {
          const isFull = idea.members.length >= idea.maxTeamSize;
          return (
            <article class="card flex flex-col">
              <div class="flex items-start justify-between gap-4">
                <h3 class="text-xl font-bold">{idea.title}</h3>
                <StatusBadge status={idea.status} />
              </div>
              <p class="mt-2 line-clamp-3 text-slate-700">{idea.problem}</p>
              <p class="mt-3 text-sm"><b>Needs:</b> {idea.neededSkills}</p>
              <p class="mt-1 text-sm text-slate-600">
                <b>Team:</b> {idea.members.length}/{idea.maxTeamSize}
                {isFull ? ' · full' : ''}
                {idea.interested.length > 0 ? ` · ${idea.interested.length} interested 👋` : ''}
              </p>
              <p class="mt-1 text-sm text-slate-500">
                {idea.members.map((m) => m.participant.name).join(', ') || 'No members yet'}
              </p>
              <a class="btn-secondary mt-4 self-start" href={`/ideas/${idea.id}`}>View details</a>
            </article>
          );
        })}
        {ideas.length === 0 && <p class="card text-slate-600">No ideas yet. Be the first to pitch one.</p>}
      </div>
    </section>

    <section>
      <div class="flex items-end justify-between">
        <h2 class="text-2xl font-bold">Open to join ({openPeople.length})</h2>
        <a class="text-sm font-semibold text-bitcoin-700 hover:underline" href="/people">See everyone →</a>
      </div>
      <p class="mt-1 text-sm text-slate-600">
        People who registered, aren’t committed to a team yet, and are open to join. Recruit them.
      </p>
      <div class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {openPeople.map((p) => (
          <div class="card">
            <p class="font-semibold">{p.name}</p>
            <p class="mt-1 text-sm text-slate-600">{p.skills}</p>
            {p.lookingFor && <p class="mt-2 text-sm text-slate-500">“{p.lookingFor}”</p>}
          </div>
        ))}
        {openPeople.length === 0 && <p class="card text-slate-600">Nobody’s in the open pool yet.</p>}
      </div>
    </section>
  </div>
);

// ---------- People directory ----------

const PersonCard: FC<{ p: PersonData }> = ({ p }) => (
  <div class="card">
    <div class="flex items-center justify-between gap-2">
      <p class="font-semibold">{p.name}</p>
      {p.openToJoin && !p.teamMember && <span class="badge bg-green-100 text-green-800">Open</span>}
      {p.teamMember && <span class="badge bg-slate-200 text-slate-700">On a team</span>}
    </div>
    <p class="mt-1 text-sm text-slate-600">{p.skills}</p>
    {p.lookingFor && <p class="mt-2 text-sm text-slate-500">“{p.lookingFor}”</p>}
    {p.teamMember && (
      <p class="mt-2 text-xs text-slate-500">
        Team: <b>{p.teamMember.idea.title}</b> · {p.teamMember.role}
      </p>
    )}
    {p.interests.length > 0 && (
      <p class="mt-2 text-xs text-slate-500">Interested in: {p.interests.map((i) => i.idea.title).join(', ')}</p>
    )}
    {p.contact && <p class="mt-2 text-xs text-slate-400">{p.contact}</p>}
  </div>
);

const Section: FC<{ title: string; subtitle?: string; children?: unknown }> = ({ title, subtitle, children }) => (
  <section>
    <h2 class="text-2xl font-bold">{title}</h2>
    {subtitle && <p class="text-sm text-slate-600">{subtitle}</p>}
    <div class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
  </section>
);

export const People: FC<{ people: PersonData[] }> = ({ people }) => {
  const open = people.filter((p) => !p.teamMember && p.openToJoin);
  const committed = people.filter((p) => p.teamMember);
  const other = people.filter((p) => !p.teamMember && !p.openToJoin);
  return (
    <div class="space-y-8">
      <div>
        <h1 class="text-3xl font-bold">People</h1>
        <p class="mt-2 text-slate-600">
          Find teammates before kickoff. Anyone marked <b>open to join</b> is looking for a team.
        </p>
        <a class="btn-primary mt-4" href="/join">Register / Edit My Profile</a>
      </div>
      <Section title={`Open to join (${open.length})`} subtitle="Not committed yet — recruit them or reach out.">
        {open.map((p) => <PersonCard p={p} />)}
        {open.length === 0 && <p class="card text-slate-600">Nobody in the open pool yet.</p>}
      </Section>
      <Section title={`Committed to a team (${committed.length})`} subtitle="Already on a team.">
        {committed.map((p) => <PersonCard p={p} />)}
        {committed.length === 0 && <p class="card text-slate-600">No committed members yet.</p>}
      </Section>
      {other.length > 0 && (
        <Section title={`Registered, not currently looking (${other.length})`}>
          {other.map((p) => <PersonCard p={p} />)}
        </Section>
      )}
    </div>
  );
};

// ---------- Participant form (Join + Me edit) ----------

export const ParticipantForm: FC<{ me?: Participant | null; heading: string; cta: string }> = ({ me, heading, cta }) => (
  <form method="post" action="/profile" class="card space-y-4">
    <h1 class="text-2xl font-bold">{heading}</h1>
    <p class="text-sm text-slate-600">
      This lightweight profile is only for this hackathon. No passwords or full accounts — your ID is kept in a
      cookie so you can come back and edit it.
    </p>
    {me && <input type="hidden" name="id" value={me.id} />}
    <div>
      <label class="label" for="name">Name</label>
      <input class="input mt-1" id="name" name="name" required value={me?.name ?? ''} placeholder="Satoshi N." />
    </div>
    <div>
      <label class="label" for="email">Email</label>
      <input class="input mt-1" id="email" name="email" type="email" required value={me?.email ?? ''} placeholder="you@example.com" />
    </div>
    <div>
      <label class="label" for="skills">Skills</label>
      <input class="input mt-1" id="skills" name="skills" required value={me?.skills ?? ''} placeholder="Rust, React, Lightning, design…" />
    </div>
    <div>
      <label class="label" for="interests">Interests</label>
      <input class="input mt-1" id="interests" name="interests" value={me?.interests ?? ''} placeholder="Privacy, payments, education…" />
    </div>
    <div>
      <label class="label" for="contact">Contact</label>
      <input class="input mt-1" id="contact" name="contact" value={me?.contact ?? ''} placeholder="Telegram / Nostr / email" />
    </div>
    <div>
      <label class="label" for="lookingFor">What you’re looking for</label>
      <input class="input mt-1" id="lookingFor" name="lookingFor" value={me?.lookingFor ?? ''} placeholder="A team building a non-custodial wallet" />
    </div>
    <label class="flex items-center gap-2 text-sm">
      <input type="checkbox" name="openToJoin" checked={me ? me.openToJoin : true} />
      <span>I’m open to join other teams (show me in the open pool)</span>
    </label>
    <button class="btn-primary">{cta}</button>
  </form>
);

export const Join: FC<{ me?: Participant | null }> = ({ me }) => (
  <div class="max-w-2xl">
    <ParticipantForm me={me} heading={me ? 'Edit your profile' : 'Register'} cta={me ? 'Save changes' : 'Register'} />
  </div>
);

export const Me: FC<{ me: Participant; team: { idea: { id: string; title: string }; role: string } | null }> = ({ me, team }) => (
  <div class="max-w-2xl space-y-6">
    <div class="card">
      <h1 class="text-2xl font-bold">My profile</h1>
      <p class="mt-1 text-sm text-slate-500">Participant ID: <code>{me.id}</code></p>
      <dl class="mt-4 grid grid-cols-3 gap-y-2 text-sm">
        <dt class="text-slate-500">Name</dt><dd class="col-span-2">{me.name}</dd>
        <dt class="text-slate-500">Email</dt><dd class="col-span-2">{me.email}</dd>
        <dt class="text-slate-500">Skills</dt><dd class="col-span-2">{me.skills}</dd>
        {me.interests && (<><dt class="text-slate-500">Interests</dt><dd class="col-span-2">{me.interests}</dd></>)}
        {me.contact && (<><dt class="text-slate-500">Contact</dt><dd class="col-span-2">{me.contact}</dd></>)}
        <dt class="text-slate-500">Open to join</dt><dd class="col-span-2">{me.openToJoin ? 'Yes' : 'No'}</dd>
        <dt class="text-slate-500">Team</dt>
        <dd class="col-span-2">
          {team ? <a class="text-bitcoin-700 hover:underline" href={`/ideas/${team.idea.id}`}>{team.idea.title} — {team.role}</a> : 'Not on a team yet'}
        </dd>
      </dl>
    </div>
    <ParticipantForm me={me} heading="Edit profile" cta="Save changes" />
  </div>
);

// ---------- New idea ----------

export const NewIdea: FC<{ me?: Participant | null; atMax: boolean }> = ({ me, atMax }) => {
  if (!me) {
    return (
      <div class="card max-w-2xl">
        <h1 class="text-2xl font-bold">Pitch an idea</h1>
        <p class="mt-2 text-slate-600">You need a profile before pitching. It only takes a moment.</p>
        <a class="btn-primary mt-4" href="/join">Register first</a>
      </div>
    );
  }
  if (atMax) {
    return (
      <div class="card max-w-2xl">
        <h1 class="text-2xl font-bold">Maximum teams reached</h1>
        <p class="mt-2 text-slate-600">
          All {EVENT.maxTeams} team slots are taken. Browse the board and join an existing idea instead.
        </p>
        <a class="btn-primary mt-4" href="/">Back to the board</a>
      </div>
    );
  }
  return (
    <form method="post" action="/ideas" class="card max-w-2xl space-y-4">
      <h1 class="text-2xl font-bold">Pitch an idea</h1>
      <p class="text-sm text-slate-600">You’ll be added as the idea owner and first team member.</p>
      <div>
        <label class="label" for="title">Title</label>
        <input class="input mt-1" id="title" name="title" required placeholder="Non-custodial X for Y" />
      </div>
      <div>
        <label class="label" for="problem">Problem</label>
        <textarea class="input mt-1" id="problem" name="problem" required rows={3} placeholder="Who is underserved, and why does it matter?" />
      </div>
      <div>
        <label class="label" for="proposedSolution">Proposed solution</label>
        <textarea class="input mt-1" id="proposedSolution" name="proposedSolution" required rows={3} placeholder="What you’ll build in 30 hours. Keep keys with the user." />
      </div>
      <div>
        <label class="label" for="neededSkills">Needed skills</label>
        <input class="input mt-1" id="neededSkills" name="neededSkills" required placeholder="Rust, Lightning, mobile, design…" />
      </div>
      <div>
        <label class="label" for="maxTeamSize">Max team size (2–6)</label>
        <input class="input mt-1" id="maxTeamSize" name="maxTeamSize" type="number" min={2} max={6} value={String(EVENT.defaultTeamSize)} />
      </div>
      <button class="btn-primary">Pitch idea</button>
    </form>
  );
};

// ---------- Idea detail ----------

export const IdeaDetail: FC<{ idea: IdeaDetailData; me?: Participant | null; onThisTeam: boolean; isInterested: boolean }> = ({
  idea,
  me,
  onThisTeam,
  isInterested,
}) => {
  const isFull = idea.members.length >= idea.maxTeamSize;
  return (
    <div class="space-y-6">
      <div class="card">
        <StatusBadge status={idea.status} />
        <h1 class="mt-3 text-3xl font-bold">{idea.title}</h1>
        <h2 class="mt-4 font-bold">Problem</h2>
        <p class="text-slate-700">{idea.problem}</p>
        <h2 class="mt-4 font-bold">Proposed solution</h2>
        <p class="text-slate-700">{idea.proposedSolution}</p>
        <p class="mt-4"><b>Needed skills:</b> {idea.neededSkills}</p>
        <p><b>Team size:</b> {idea.members.length}/{idea.maxTeamSize}{isFull ? ' · full' : ''}</p>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <section class="card">
          <h2 class="text-xl font-bold">Team members ({idea.members.length})</h2>
          <ul class="mt-3 space-y-2">
            {idea.members.map((m) => (
              <li>
                <b>{m.participant.name}</b> — {m.role}
                {m.motivation && <span class="text-slate-600"> · {m.motivation}</span>}
              </li>
            ))}
            {idea.members.length === 0 && <li class="text-slate-500">No members yet.</li>}
          </ul>
        </section>

        <section class="card">
          <h2 class="text-xl font-bold">Open to join ({idea.interested.length})</h2>
          <p class="text-sm text-slate-600">People signalling interest — not committed yet.</p>
          <ul class="mt-3 flex flex-wrap gap-2">
            {idea.interested.map((i) => <li class="chip">{i.participant.name}</li>)}
            {idea.interested.length === 0 && <li class="text-sm text-slate-500">No one yet — be the first.</li>}
          </ul>
          {me && !onThisTeam && (
            <form method="post" action={`/ideas/${idea.id}/interest`} class="mt-4">
              <button class={isInterested ? 'btn-secondary' : 'btn'}>
                {isInterested ? 'Remove my interest' : 'I’m open to join this'}
              </button>
              <p class="mt-2 text-xs text-slate-500">Low-commitment signal. You can be interested in several ideas at once.</p>
            </form>
          )}
        </section>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        {!onThisTeam ? (
          <form method="post" action={`/ideas/${idea.id}/join`} class="card space-y-3">
            <h2 class="text-xl font-bold">Commit to this team</h2>
            <p class="text-sm text-slate-600">A hard commitment — you can only be on one team. This counts toward team size.</p>
            {me ? (
              <>
                <div>
                  <label class="label" for="role">Role</label>
                  <input class="input mt-1" id="role" name="role" required placeholder="e.g. Frontend, Protocol, Design" />
                </div>
                <div>
                  <label class="label" for="motivation">Motivation</label>
                  <textarea class="input mt-1" id="motivation" name="motivation" maxlength={500} placeholder="What you can help with" />
                </div>
                <button class="btn-primary" disabled={isFull}>{isFull ? 'Team full' : 'Commit to team'}</button>
              </>
            ) : (
              <a class="btn-primary" href="/join">Register to join</a>
            )}
          </form>
        ) : (
          <form method="post" action={`/ideas/${idea.id}/leave`} class="card space-y-3">
            <h2 class="text-xl font-bold">You’re on this team</h2>
            <p class="text-sm text-slate-600">You can leave unless formation is frozen.</p>
            <button class="btn-secondary">Leave this team</button>
          </form>
        )}

        <form method="post" action={`/ideas/${idea.id}/comment`} class="card space-y-3">
          <h2 class="text-xl font-bold">Add a comment</h2>
          {me ? (
            <>
              <textarea class="input" name="body" maxlength={500} required placeholder="Ask a question or offer to help…" />
              <button class="btn">Comment</button>
            </>
          ) : (
            <a class="btn" href="/join">Register to comment</a>
          )}
        </form>
      </div>

      <section class="card">
        <h2 class="text-xl font-bold">Discussion</h2>
        <div class="mt-3 space-y-3">
          {idea.comments.map((c) => (
            <p class="border-t pt-3">
              <b>{c.participant.name}</b> <span class="text-sm text-slate-500">{new Date(c.createdAt).toLocaleString()}</span>
              <br />
              {c.body}
            </p>
          ))}
          {idea.comments.length === 0 && <p class="text-slate-500">No comments yet.</p>}
        </div>
      </section>
    </div>
  );
};

// ---------- About / program ----------

export const About: FC = () => (
  <div class="space-y-8">
    <div>
      <h1 class="text-3xl font-bold">{EVENT.name}</h1>
      <p class="mt-2 text-slate-600">{EVENT.format} · {EVENT.location}</p>
      <p class="mt-4 max-w-3xl text-slate-700">{EVENT.themeBlurb}</p>
      <p class="mt-3 max-w-3xl rounded-xl border border-bitcoin-100 bg-bitcoin-50 p-3 text-sm text-bitcoin-700">⚠ {EVENT.hardGate}</p>
    </div>

    <section>
      <h2 class="text-2xl font-bold">Schedule</h2>
      <div class="mt-4 space-y-6">
        {SCHEDULE.map((day) => (
          <div>
            <h3 class="font-bold text-slate-800">{day.day}</h3>
            <ul class="mt-2 divide-y divide-slate-100">
              {day.items.map((it) => (
                <li class="flex gap-4 py-2 text-sm">
                  <span class="w-24 shrink-0 font-mono text-slate-500">{it.time}</span>
                  <span>
                    {it.what}
                    {it.where && <span class="text-slate-400"> · {it.where}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>

    <section class="grid gap-6 md:grid-cols-2">
      <div>
        <h2 class="text-2xl font-bold">Judging</h2>
        <ul class="mt-3 space-y-2 text-sm">
          {JUDGING.map((j) => (
            <li class="card">
              <div class="flex justify-between font-semibold"><span>{j.criterion}</span><span class="text-bitcoin-700">{j.weight}</span></div>
              <p class="mt-1 text-slate-600">{j.note}</p>
            </li>
          ))}
        </ul>
      </div>
      <div class="space-y-6">
        <div>
          <h2 class="text-2xl font-bold">Prizes</h2>
          <ul class="mt-3 space-y-2 text-sm">
            {PRIZES.map((p) => (
              <li class="card flex justify-between"><b>{p.place}</b><span class="text-slate-600">{p.prize}</span></li>
            ))}
          </ul>
        </div>
        <div>
          <h2 class="text-2xl font-bold">Mentors</h2>
          <div class="mt-3 flex flex-wrap gap-2">
            {MENTORS.map((m) => <span class="chip">{m}</span>)}
          </div>
        </div>
      </div>
    </section>
  </div>
);
