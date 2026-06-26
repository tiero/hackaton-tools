import type { FC } from 'hono/jsx';
import { StatusBadge } from './layout';
import { EVENT, JUDGING, JUDGES, MENTORS, PRIZES, SCHEDULE, TEAM_RULES } from '../lib/event';
import type {
  IdeaCardData,
  IdeaDetailData,
  Participant,
  PersonData,
} from '../lib/types';

const errorText: Record<string, string> = {
  frozen: 'Team formation is frozen by the organizers.',
  full: 'This team is already full.',
  'already-on-team': "You're already committed to a team. Leave it first to join another.",
  max: `The maximum of ${EVENT.maxTeams} teams has been reached. Join an existing idea instead.`,
  'need-profile': 'Register a profile first, then you can pitch or join.',
  closed: 'This team is already formed and not accepting new members.',
  'not-owner': 'Only the idea owner can do that.',
  notfound: 'That item could not be found.',
};

export function flashFrom(query: { error?: string; ok?: string }): { kind: 'error' | 'ok'; message: string } | null {
  if (query.error) return { kind: 'error', message: errorText[query.error] ?? query.error };
  if (query.ok) return { kind: 'ok', message: query.ok };
  return null;
}

// ---------- Home / board ----------

export const Home: FC<{ ideas: IdeaCardData[] }> = ({ ideas }) => (
  <div class="space-y-10">
    <section class="rounded-3xl bg-gradient-to-br from-bitcoin-600 to-amber-500 p-8 text-white">
      <p class="text-sm font-semibold uppercase tracking-wide text-orange-100">
        {EVENT.dates} · Lugano
      </p>
      <h1 class="mt-2 text-3xl font-bold sm:text-4xl">{EVENT.name}</h1>
      <div class="mt-6 flex flex-wrap gap-3">
        <a class="btn bg-white text-bitcoin-700 hover:bg-orange-50" href="/join">Register / Edit My Profile</a>
        <a class="btn bg-slate-900 hover:bg-slate-800" href="/ideas/new">Pitch an Idea</a>
        <a class="btn-secondary bg-transparent text-white hover:bg-white/10" href="/people">Find teammates</a>
      </div>
      <p class="mt-4 text-sm text-orange-100">
        Pitch an idea to lead a team, or join one that excites you. You can be on one team — nothing is final
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
                <div class="flex shrink-0 gap-1">
                  <StatusBadge status={idea.status} />
                  {!idea.joinable && <span class="badge bg-slate-200 text-slate-700">Closed</span>}
                </div>
              </div>
              <p class="mt-2 line-clamp-3 text-slate-700">{idea.problem}</p>
              <p class="mt-3 text-sm"><b>Needs:</b> {idea.neededSkills}</p>
              <p class="mt-1 text-sm text-slate-600">
                <b>Team:</b> {idea.members.length}/{idea.maxTeamSize}
                {isFull ? ' · full' : ''}
                {!idea.joinable ? ' · pre-formed' : ''}
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
  </div>
);

// ---------- People directory ----------

const PersonCard: FC<{ p: PersonData }> = ({ p }) => (
  <div class="card">
    <div class="flex items-center justify-between gap-2">
      <p class="font-semibold">{p.name}</p>
      {p.teamMember && <span class="badge bg-slate-200 text-slate-700">On a team</span>}
    </div>
    <p class="mt-1 text-sm text-slate-600">{p.skills}</p>
    {p.teamMember && (
      <p class="mt-2 text-xs text-slate-500">
        Team: <b>{p.teamMember.idea.title}</b> · {p.teamMember.role}
      </p>
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
  const free = people.filter((p) => !p.teamMember);
  const committed = people.filter((p) => p.teamMember);
  return (
    <div class="space-y-8">
      <div>
        <h1 class="text-3xl font-bold">People</h1>
        <p class="mt-2 text-slate-600">Everyone registered for the hackathon. Reach out and build a team.</p>
        <a class="btn-primary mt-4" href="/join">Register / Edit My Profile</a>
      </div>
      <Section title={`Not on a team yet (${free.length})`} subtitle="Recruit them or reach out.">
        {free.map((p) => <PersonCard p={p} />)}
        {free.length === 0 && <p class="card text-slate-600">Everyone’s on a team.</p>}
      </Section>
      <Section title={`On a team (${committed.length})`}>
        {committed.map((p) => <PersonCard p={p} />)}
        {committed.length === 0 && <p class="card text-slate-600">No one has committed to a team yet.</p>}
      </Section>
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
      <label class="label" for="skills">Skills</label>
      <input class="input mt-1" id="skills" name="skills" required value={me?.skills ?? ''} placeholder="Rust, React, Lightning, design..." />
    </div>
    <div>
      <label class="label" for="contact">Contact</label>
      <input class="input mt-1" id="contact" name="contact" value={me?.contact ?? ''} placeholder="Telegram / Nostr / email" />
    </div>
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
        <dt class="text-slate-500">Skills</dt><dd class="col-span-2">{me.skills}</dd>
        {me.contact && (<><dt class="text-slate-500">Contact</dt><dd class="col-span-2">{me.contact}</dd></>)}
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
      <p class="text-sm text-slate-600">You'll be added as the idea owner and first team member.</p>
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
        <textarea class="input mt-1" id="proposedSolution" name="proposedSolution" required rows={3} placeholder="What you'll build in 30 hours. Keep keys with the user." />
      </div>
      <div>
        <label class="label" for="neededSkills">Needed skills</label>
        <input class="input mt-1" id="neededSkills" name="neededSkills" required placeholder="Rust, Lightning, mobile, design..." />
      </div>
      <div>
        <label class="label" for="maxTeamSize">Team size (2–6)</label>
        <input class="input mt-1" id="maxTeamSize" name="maxTeamSize" type="number" min={2} max={6} value={String(EVENT.defaultTeamSize)} />
      </div>
      <label class="flex items-start gap-2 text-sm">
        <input type="checkbox" name="joinable" checked class="mt-1" />
        <span>
          <b>Open for others to join.</b> Uncheck if your team is already formed — it’ll still be listed publicly,
          but nobody can join. You can add your teammates by name on the next page.
        </span>
      </label>
      <button class="btn-primary">Pitch idea</button>
    </form>
  );
};

// ---------- Idea detail ----------

const OwnerPanel: FC<{ idea: IdeaDetailData; isFull: boolean }> = ({ idea, isFull }) => (
  <section class="card border-bitcoin-100 bg-bitcoin-50/40">
    <h2 class="text-xl font-bold">Owner tools</h2>
    <div class="mt-3 grid gap-4 md:grid-cols-2">
      <form method="post" action={`/ideas/${idea.id}/members`} class="space-y-2">
        <h3 class="font-semibold">Add a teammate</h3>
        <p class="text-sm text-slate-600">For people already on your team. They’re added as records — no sign-up needed.</p>
        <input class="input" name="name" required placeholder="Name" />
        <input class="input" name="skills" required placeholder="Skills (e.g. Rust, design)" />
        <input class="input" name="contact" placeholder="Contact (e.g. Telegram @handle)" />
        <input class="input" name="role" required placeholder="Role on the team" />
        <button class="btn-primary" disabled={isFull}>{isFull ? 'Team full' : 'Add teammate'}</button>
      </form>
      <form method="post" action={`/ideas/${idea.id}/settings`} class="space-y-2">
        <h3 class="font-semibold">Team settings</h3>
        <label class="flex items-start gap-2 text-sm">
          <input type="checkbox" name="joinable" checked={idea.joinable} class="mt-1" />
          <span>Open for others to join. Uncheck if your team is already formed.</span>
        </label>
        <button class="btn-secondary">Save settings</button>
      </form>
    </div>
  </section>
);

export const IdeaDetail: FC<{ idea: IdeaDetailData; me?: Participant | null; onThisTeam: boolean; isOwner: boolean }> = ({
  idea,
  me,
  onThisTeam,
  isOwner,
}) => {
  const isFull = idea.members.length >= idea.maxTeamSize;
  return (
    <div class="space-y-6">
      <div class="card">
        <div class="flex gap-1">
          <StatusBadge status={idea.status} />
          {!idea.joinable && <span class="badge bg-slate-200 text-slate-700">Closed to new members</span>}
        </div>
        <h1 class="mt-3 text-3xl font-bold">{idea.title}</h1>
        <h2 class="mt-4 font-bold">Problem</h2>
        <p class="text-slate-700">{idea.problem}</p>
        <h2 class="mt-4 font-bold">Proposed solution</h2>
        <p class="text-slate-700">{idea.proposedSolution}</p>
        <p class="mt-4"><b>Needed skills:</b> {idea.neededSkills}</p>
        <p><b>Team size:</b> {idea.members.length}/{idea.maxTeamSize}{isFull ? ' · full' : ''}</p>
        {!idea.joinable && <p class="mt-1 text-sm text-slate-500">This team is already formed — not accepting new members.</p>}
      </div>

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

      {isOwner && <OwnerPanel idea={idea} isFull={isFull} />}

      <div class="grid gap-4 md:grid-cols-2">
        {onThisTeam ? (
          <form method="post" action={`/ideas/${idea.id}/leave`} class="card space-y-3">
            <h2 class="text-xl font-bold">You're on this team</h2>
            <p class="text-sm text-slate-600">You can leave unless formation is frozen.</p>
            <button class="btn-secondary">Leave this team</button>
          </form>
        ) : !idea.joinable ? (
          <div class="card">
            <h2 class="text-xl font-bold">Team already formed</h2>
            <p class="mt-2 text-sm text-slate-600">This team isn’t accepting new members. Browse other ideas on the board.</p>
          </div>
        ) : (
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
        )}

        <form method="post" action={`/ideas/${idea.id}/comment`} class="card space-y-3">
          <h2 class="text-xl font-bold">Add a comment</h2>
          {me ? (
            <>
              <textarea class="input" name="body" maxlength={500} required placeholder="Ask a question or offer to help..." />
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
            {MENTORS.map((m) => (
              <span class="chip">{m.name} <span class="ml-1 text-xs text-slate-500">({m.role})</span></span>
            ))}
          </div>
        </div>
        <div>
          <h2 class="text-2xl font-bold">Judges</h2>
          <div class="mt-3 flex flex-wrap gap-2">
            {JUDGES.map((j) => <span class="chip">{j}</span>)}
          </div>
        </div>
        <div>
          <h2 class="text-2xl font-bold">Team Rules</h2>
          <ul class="mt-3 space-y-1 text-sm text-slate-700">
            {TEAM_RULES.map((r) => <li class="flex gap-2"><span class="text-bitcoin-600">·</span>{r}</li>)}
          </ul>
        </div>
      </div>
    </section>
  </div>
);
