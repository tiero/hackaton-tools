import { Hono } from 'hono';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import { eq, and, desc } from 'drizzle-orm';
import type { Env } from '../worker-configuration';
import { getDb, type DB } from './db';
import { participant, idea, teamMember, comment } from './db/schema';
import { isFrozen, setFrozen, refreshIdeaStatus, refreshAllIdeas } from './lib/state';
import { required, optional, intRange, boolean, newId, ValidationError } from './lib/validation';
import type { Participant } from './lib/types';
import { EVENT } from './lib/event';
import { Layout, render } from './views/layout';
import { Home, People, Join, Me, NewIdea, IdeaDetail, About, flashFrom } from './views/pages';
import { AdminLogin, AdminDashboard } from './views/admin';

const PID_COOKIE = 'pid';
const ADMIN_COOKIE = 'admin_ok';
const YEAR = 60 * 60 * 24 * 365;

const app = new Hono<{ Bindings: Env }>();

// Resolve the current participant from the pid cookie.
async function getMe(c: any, db: DB): Promise<Participant | null> {
  const pid = getCookie(c, PID_COOKIE);
  if (!pid) return null;
  const me = await db.query.participant.findFirst({ where: eq(participant.id, pid) });
  return me ?? null;
}

function isAdmin(c: any): boolean {
  const pw = c.env.ADMIN_PASSWORD;
  return Boolean(pw) && getCookie(c, ADMIN_COOKIE) === pw;
}

// Redirect helper that carries a flash message in the query string.
function back(c: any, path: string, flash?: { error?: string; ok?: string }) {
  const qs = flash?.error
    ? `?error=${encodeURIComponent(flash.error)}`
    : flash?.ok
      ? `?ok=${encodeURIComponent(flash.ok)}`
      : '';
  return c.redirect(path + qs);
}

// ---------------- Board / home ----------------

app.get('/', async (c) => {
  const db = getDb(c.env.DB);
  const me = await getMe(c, db);
  const ideas = await db.query.idea.findMany({
    with: { members: { with: { participant: true } } },
    orderBy: [desc(idea.createdAt)],
  });
  return c.html(
    render(
      <Layout title="Board" active="board" me={me} flash={flashFrom(c.req.query())}>
        <Home ideas={ideas} />
      </Layout>,
    ),
  );
});

// ---------------- People directory ----------------

app.get('/people', async (c) => {
  const db = getDb(c.env.DB);
  const me = await getMe(c, db);
  const people = await db.query.participant.findMany({
    with: { teamMember: { with: { idea: true } } },
    orderBy: [desc(participant.createdAt)],
  });
  return c.html(
    render(
      <Layout title="People" active="people" me={me}>
        <People people={people} />
      </Layout>,
    ),
  );
});

// ---------------- About / program ----------------

app.get('/about', async (c) => {
  const db = getDb(c.env.DB);
  const me = await getMe(c, db);
  return c.html(
    render(
      <Layout title="Program" active="about" me={me}>
        <About />
      </Layout>,
    ),
  );
});

// ---------------- Register / profile ----------------

app.get('/join', async (c) => {
  const db = getDb(c.env.DB);
  const me = await getMe(c, db);
  return c.html(
    render(
      <Layout title="Register" active="me" me={me} flash={flashFrom(c.req.query())}>
        <Join me={me} />
      </Layout>,
    ),
  );
});

app.get('/me', async (c) => {
  const db = getDb(c.env.DB);
  const me = await getMe(c, db);
  if (!me) return c.redirect('/join');
  const tm = await db.query.teamMember.findFirst({
    where: eq(teamMember.participantId, me.id),
    with: { idea: true },
  });
  const team = tm ? { idea: { id: tm.idea.id, title: tm.idea.title }, role: tm.role } : null;
  return c.html(
    render(
      <Layout title="My profile" active="me" me={me} flash={flashFrom(c.req.query())}>
        <Me me={me} team={team} />
      </Layout>,
    ),
  );
});

app.post('/profile', async (c) => {
  const db = getDb(c.env.DB);
  const form = await c.req.formData();
  try {
    const data = {
      name: required(form.get('name'), 'Name', 120),
      skills: required(form.get('skills'), 'Skills', 1000),
      contact: optional(form.get('contact'), 1000),
    };
    const existingId = getCookie(c, PID_COOKIE);
    if (existingId) {
      const found = await db.query.participant.findFirst({ where: eq(participant.id, existingId) });
      if (found) {
        await db.update(participant).set(data).where(eq(participant.id, existingId));
        return back(c, '/me', { ok: 'Profile saved.' });
      }
    }
    const id = newId();
    await db.insert(participant).values({ id, ...data });
    setCookie(c, PID_COOKIE, id, { httpOnly: true, sameSite: 'Lax', path: '/', maxAge: YEAR });
    return back(c, '/me', { ok: 'Welcome! Your profile is saved.' });
  } catch (e) {
    const msg = e instanceof ValidationError ? e.message : 'Could not save profile.';
    return back(c, '/join', { error: msg });
  }
});

// ---------------- Ideas ----------------

app.get('/ideas/new', async (c) => {
  const db = getDb(c.env.DB);
  const me = await getMe(c, db);
  const count = (await db.select({ id: idea.id }).from(idea)).length;
  return c.html(
    render(
      <Layout title="Pitch an idea" active="propose" me={me} flash={flashFrom(c.req.query())}>
        <NewIdea me={me} atMax={count >= EVENT.maxTeams} />
      </Layout>,
    ),
  );
});

app.post('/ideas', async (c) => {
  const db = getDb(c.env.DB);
  const me = await getMe(c, db);
  if (!me) return back(c, '/ideas/new', { error: 'need-profile' });
  if (await isFrozen(db)) return back(c, '/ideas/new', { error: 'frozen' });
  const count = (await db.select({ id: idea.id }).from(idea)).length;
  if (count >= EVENT.maxTeams) return back(c, '/ideas/new', { error: 'max' });
  const form = await c.req.formData();
  try {
    const id = newId();
    await db.insert(idea).values({
      id,
      title: required(form.get('title'), 'Idea title', 160),
      problem: required(form.get('problem'), 'Problem', 2000),
      proposedSolution: required(form.get('proposedSolution'), 'Proposed solution', 2000),
      neededSkills: required(form.get('neededSkills'), 'Needed skills', 1000),
      maxTeamSize: intRange(form.get('maxTeamSize'), 'Max team size', 2, 6, EVENT.defaultTeamSize),
      joinable: boolean(form.get('joinable')),
      creatorParticipantId: me.id,
    });
    // The pitcher is auto-added as the idea owner / first member.
    await db.insert(teamMember).values({
      id: newId(),
      ideaId: id,
      participantId: me.id,
      role: 'Idea owner',
      motivation: 'Proposed this idea.',
    });
    await refreshIdeaStatus(db, id);
    return c.redirect(`/ideas/${id}`);
  } catch (e) {
    const msg = e instanceof ValidationError ? e.message : 'You may already be on a team — leave it before pitching.';
    return back(c, '/ideas/new', { error: msg });
  }
});

app.get('/ideas/:id', async (c) => {
  const db = getDb(c.env.DB);
  const me = await getMe(c, db);
  const id = c.req.param('id');
  const row = await db.query.idea.findFirst({
    where: eq(idea.id, id),
    with: {
      members: { with: { participant: true } },
      comments: { with: { participant: true }, orderBy: [desc(comment.createdAt)] },
    },
  });
  if (!row) return c.notFound();
  const onThisTeam = !!me && row.members.some((m) => m.participantId === me.id);
  const isOwner = !!me && row.creatorParticipantId === me.id;
  return c.html(
    render(
      <Layout title={row.title} active="board" me={me} flash={flashFrom(c.req.query())}>
        <IdeaDetail idea={row} me={me} onThisTeam={onThisTeam} isOwner={isOwner} />
      </Layout>,
    ),
  );
});

app.post('/ideas/:id/join', async (c) => {
  const db = getDb(c.env.DB);
  const me = await getMe(c, db);
  const id = c.req.param('id');
  if (!me) return c.redirect('/join');
  if (await isFrozen(db)) return back(c, `/ideas/${id}`, { error: 'frozen' });
  const row = await db.query.idea.findFirst({ where: eq(idea.id, id), with: { members: true } });
  if (!row) return c.notFound();
  if (!row.joinable) return back(c, `/ideas/${id}`, { error: 'closed' });
  if (row.members.length >= row.maxTeamSize) return back(c, `/ideas/${id}`, { error: 'full' });
  const form = await c.req.formData();
  try {
    await db.insert(teamMember).values({
      id: newId(),
      ideaId: id,
      participantId: me.id,
      role: required(form.get('role'), 'Role', 120),
      motivation: optional(form.get('motivation'), 500),
    });
  } catch (e) {
    if (e instanceof ValidationError) return back(c, `/ideas/${id}`, { error: e.message });
    return back(c, `/ideas/${id}`, { error: 'already-on-team' });
  }
  await refreshIdeaStatus(db, id);
  return c.redirect(`/ideas/${id}`);
});

app.post('/ideas/:id/leave', async (c) => {
  const db = getDb(c.env.DB);
  const me = await getMe(c, db);
  const id = c.req.param('id');
  if (!me) return c.redirect('/join');
  if (await isFrozen(db)) return back(c, `/ideas/${id}`, { error: 'frozen' });
  await db.delete(teamMember).where(and(eq(teamMember.ideaId, id), eq(teamMember.participantId, me.id)));
  await refreshIdeaStatus(db, id);
  return c.redirect(`/ideas/${id}`);
});

// Owner adds an already-matched teammate manually (just a record — no login for them).
app.post('/ideas/:id/members', async (c) => {
  const db = getDb(c.env.DB);
  const me = await getMe(c, db);
  const id = c.req.param('id');
  if (!me) return c.redirect('/join');
  const row = await db.query.idea.findFirst({ where: eq(idea.id, id), with: { members: true } });
  if (!row) return c.notFound();
  if (row.creatorParticipantId !== me.id) return back(c, `/ideas/${id}`, { error: 'not-owner' });
  if (await isFrozen(db)) return back(c, `/ideas/${id}`, { error: 'frozen' });
  if (row.members.length >= row.maxTeamSize) return back(c, `/ideas/${id}`, { error: 'full' });
  const form = await c.req.formData();
  try {
    const pid = newId();
    await db.insert(participant).values({
      id: pid,
      name: required(form.get('name'), 'Name', 120),
      skills: required(form.get('skills'), 'Skills', 1000),
      contact: optional(form.get('contact'), 1000),
    });
    await db.insert(teamMember).values({
      id: newId(),
      ideaId: id,
      participantId: pid,
      role: required(form.get('role'), 'Role', 120),
      motivation: optional(form.get('motivation'), 500),
    });
  } catch (e) {
    const msg = e instanceof ValidationError ? e.message : 'Could not add the teammate.';
    return back(c, `/ideas/${id}`, { error: msg });
  }
  await refreshIdeaStatus(db, id);
  return back(c, `/ideas/${id}`, { ok: 'Teammate added.' });
});

// Owner toggles whether the team accepts new members.
app.post('/ideas/:id/settings', async (c) => {
  const db = getDb(c.env.DB);
  const me = await getMe(c, db);
  const id = c.req.param('id');
  if (!me) return c.redirect('/join');
  const row = await db.query.idea.findFirst({ where: eq(idea.id, id) });
  if (!row) return c.notFound();
  if (row.creatorParticipantId !== me.id) return back(c, `/ideas/${id}`, { error: 'not-owner' });
  const form = await c.req.formData();
  await db.update(idea).set({ joinable: boolean(form.get('joinable')) }).where(eq(idea.id, id));
  return back(c, `/ideas/${id}`, { ok: 'Team settings updated.' });
});

app.post('/ideas/:id/comment', async (c) => {
  const db = getDb(c.env.DB);
  const me = await getMe(c, db);
  const id = c.req.param('id');
  if (!me) return c.redirect('/join');
  const form = await c.req.formData();
  try {
    await db.insert(comment).values({
      id: newId(),
      ideaId: id,
      participantId: me.id,
      body: required(form.get('body'), 'Comment', 500),
    });
  } catch (e) {
    const msg = e instanceof ValidationError ? e.message : 'Could not post comment.';
    return back(c, `/ideas/${id}`, { error: msg });
  }
  return c.redirect(`/ideas/${id}`);
});

// ---------------- Admin ----------------

app.get('/admin', async (c) => {
  const db = getDb(c.env.DB);
  if (!isAdmin(c)) {
    return c.html(
      render(
        <Layout title="Admin">
          <AdminLogin error={c.req.query('error') === '1'} />
        </Layout>,
      ),
    );
  }
  const ideas = await db.query.idea.findMany({
    with: {
      members: { with: { participant: true } },
      comments: { with: { participant: true } },
    },
    orderBy: [desc(idea.createdAt)],
  });
  const participants = await db.query.participant.findMany({
    with: { teamMember: { with: { idea: true } } },
    orderBy: [desc(participant.createdAt)],
  });
  const frozen = await isFrozen(db);
  return c.html(
    render(
      <Layout title="Admin">
        <AdminDashboard ideas={ideas} participants={participants} frozen={frozen} />
      </Layout>,
    ),
  );
});

app.post('/admin/login', async (c) => {
  const form = await c.req.formData();
  const password = String(form.get('password') ?? '');
  if (!c.env.ADMIN_PASSWORD || password !== c.env.ADMIN_PASSWORD) {
    return c.redirect('/admin?error=1');
  }
  setCookie(c, ADMIN_COOKIE, c.env.ADMIN_PASSWORD, { httpOnly: true, sameSite: 'Lax', path: '/', maxAge: 60 * 60 * 8 });
  return c.redirect('/admin');
});

app.post('/admin/logout', (c) => {
  deleteCookie(c, ADMIN_COOKIE, { path: '/' });
  return c.redirect('/admin');
});

app.post('/admin/action', async (c) => {
  const db = getDb(c.env.DB);
  if (!isAdmin(c)) return c.redirect('/admin');
  const form = await c.req.formData();
  const action = String(form.get('action'));
  if (action === 'freeze' || action === 'unfreeze') {
    await setFrozen(db, action === 'freeze');
    await refreshAllIdeas(db);
  } else if (action === 'deleteIdea') {
    await db.delete(idea).where(eq(idea.id, String(form.get('ideaId'))));
  } else if (action === 'removeMember') {
    const memberId = String(form.get('memberId'));
    const m = await db.query.teamMember.findFirst({ where: eq(teamMember.id, memberId) });
    if (m) {
      await db.delete(teamMember).where(eq(teamMember.id, memberId));
      await refreshIdeaStatus(db, m.ideaId);
    }
  }
  return c.redirect('/admin');
});

// ---------------- CSV exports ----------------

const esc = (v: unknown) => `"${String(v ?? '').replaceAll('"', '""')}"`;
const csv = (rows: unknown[][]) => rows.map((r) => r.map(esc).join(',')).join('\n');

app.get('/admin/export/teams.csv', async (c) => {
  const db = getDb(c.env.DB);
  if (!isAdmin(c)) return c.text('Unauthorized', 401);
  const ideas = await db.query.idea.findMany({ with: { members: { with: { participant: true } } } });
  const rows: unknown[][] = [
    ['idea title', 'problem', 'needed skills', 'max team size', 'member name', 'member skills', 'member contact', 'team role', 'motivation'],
  ];
  for (const i of ideas) {
    if (i.members.length === 0) rows.push([i.title, i.problem, i.neededSkills, i.maxTeamSize, '', '', '', '', '']);
    for (const m of i.members) {
      rows.push([i.title, i.problem, i.neededSkills, i.maxTeamSize, m.participant.name, m.participant.skills, m.participant.contact ?? '', m.role, m.motivation ?? '']);
    }
  }
  return c.body(csv(rows), 200, {
    'content-type': 'text/csv; charset=utf-8',
    'content-disposition': 'attachment; filename="teams.csv"',
  });
});

app.get('/admin/export/participants.csv', async (c) => {
  const db = getDb(c.env.DB);
  if (!isAdmin(c)) return c.text('Unauthorized', 401);
  const people = await db.query.participant.findMany({
    with: { teamMember: { with: { idea: true } } },
  });
  const rows: unknown[][] = [['name', 'skills', 'contact', 'team title']];
  for (const p of people) {
    rows.push([p.name, p.skills, p.contact ?? '', p.teamMember?.idea.title ?? '']);
  }
  return c.body(csv(rows), 200, {
    'content-type': 'text/csv; charset=utf-8',
    'content-disposition': 'attachment; filename="participants.csv"',
  });
});

// ---------------- 404 ----------------

app.notFound((c) =>
  c.html(
    render(
      <Layout title="Not found">
        <div class="card">
          <h1 class="text-2xl font-bold">Not found</h1>
          <p class="mt-2 text-slate-600">That page or idea doesn’t exist.</p>
          <a class="btn-primary mt-4" href="/">Back to the board</a>
        </div>
      </Layout>,
    ),
    404,
  ),
);

export default app;
