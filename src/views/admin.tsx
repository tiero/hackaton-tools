import type { FC } from 'hono/jsx';
import type { IdeaDetailData, PersonData } from '../lib/types';

export const AdminLogin: FC<{ error?: boolean }> = ({ error }) => (
  <div class="max-w-md">
    <h1 class="mb-4 text-3xl font-bold">Admin</h1>
    <form method="post" action="/admin/login" class="card space-y-3">
      <p class="text-sm text-slate-600">Enter the organizer password.</p>
      {error && <p class="rounded-lg bg-red-50 p-2 text-sm text-red-700">Incorrect password.</p>}
      <input class="input" name="password" type="password" required placeholder="ADMIN_PASSWORD" autofocus />
      <button class="btn-primary">Log in</button>
    </form>
  </div>
);

export const AdminDashboard: FC<{
  ideas: IdeaDetailData[];
  participants: PersonData[];
  frozen: boolean;
}> = ({ ideas, participants, frozen }) => (
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-3xl font-bold">Admin</h1>
      <form method="post" action="/admin/logout">
        <button class="text-sm text-slate-500 hover:underline">Log out</button>
      </form>
    </div>

    <div class="card flex flex-wrap items-center gap-3">
      <form method="post" action="/admin/action">
        <input type="hidden" name="action" value={frozen ? 'unfreeze' : 'freeze'} />
        <button class="btn">{frozen ? 'Unfreeze' : 'Freeze'} team formation</button>
      </form>
      <a class="btn-secondary" href="/admin/export/teams.csv">Export teams CSV</a>
      <a class="btn-secondary" href="/admin/export/participants.csv">Export participants CSV</a>
      <span class="text-sm text-slate-500">Status: {frozen ? 'frozen 🔒' : 'open'}</span>
    </div>

    <section class="card">
      <h2 class="text-xl font-bold">Teams / ideas ({ideas.length})</h2>
      {ideas.map((i) => (
        <div class="mt-4 border-t pt-4">
          <div class="flex flex-wrap items-center gap-3">
            <b>{i.title}</b>
            <span class="text-sm text-slate-500">
              {i.members.length}/{i.maxTeamSize} · {i.interested.length} interested
            </span>
            <form method="post" action="/admin/action" class="ml-auto">
              <input type="hidden" name="action" value="deleteIdea" />
              <input type="hidden" name="ideaId" value={i.id} />
              <button class="text-sm text-red-700 hover:underline">Delete idea</button>
            </form>
          </div>
          <ul class="mt-2 space-y-1">
            {i.members.map((m) => (
              <li class="text-sm">
                {m.participant.name} — {m.role}
                <form method="post" action="/admin/action" class="inline">
                  <input type="hidden" name="action" value="removeMember" />
                  <input type="hidden" name="memberId" value={m.id} />
                  <button class="ml-2 text-red-700 hover:underline">Remove</button>
                </form>
              </li>
            ))}
            {i.members.length === 0 && <li class="text-sm text-slate-400">No members.</li>}
          </ul>
        </div>
      ))}
      {ideas.length === 0 && <p class="mt-3 text-slate-500">No ideas yet.</p>}
    </section>

    <section class="card">
      <h2 class="text-xl font-bold">Participants ({participants.length})</h2>
      <ul class="mt-3 space-y-1 text-sm">
        {participants.map((p) => (
          <li>
            {p.name} · {p.email} · {p.teamMember?.idea.title ?? 'No team'}
            {p.openToJoin && !p.teamMember ? ' · open to join' : ''}
          </li>
        ))}
      </ul>
    </section>
  </div>
);
