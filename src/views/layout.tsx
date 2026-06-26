import type { FC, PropsWithChildren } from 'hono/jsx';
import { EVENT } from '../lib/event';

export function render(node: unknown): string {
  return '<!doctype html>' + String(node);
}

type LayoutProps = PropsWithChildren<{
  title?: string;
  me?: { id: string; name: string } | null;
  active?: string;
  flash?: { kind: 'error' | 'ok'; message: string } | null;
}>;

const navItems = [
  { href: '/', label: 'Board', key: 'board' },
  { href: '/people', label: 'People', key: 'people' },
  { href: '/ideas/new', label: 'Propose Idea', key: 'propose' },
  { href: '/about', label: 'Program', key: 'about' },
  { href: '/me', label: 'My Profile', key: 'me' },
];

export const Layout: FC<LayoutProps> = ({ children, title, me, active, flash }) => {
  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title ? `${title} · ${EVENT.name}` : EVENT.name}</title>
        <meta name="description" content={EVENT.themeBlurb} />
        <link rel="stylesheet" href="/styles.css" />
        <link
          rel="icon"
          href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E%E2%82%BF%3C/text%3E%3C/svg%3E"
        />
      </head>
      <body class="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <header class="border-b border-slate-200 bg-white">
          <div class="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
            <a href="/" class="flex items-center gap-2 font-bold">
              <span class="grid h-7 w-7 place-items-center rounded-lg bg-bitcoin-500 text-white">₿</span>
              <span class="hidden sm:inline">Plan ₿ Hackathon</span>
            </a>
            <nav class="flex flex-1 flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              {navItems.map((n) => (
                <a
                  href={n.href}
                  class={`hover:text-bitcoin-700 ${active === n.key ? 'font-semibold text-bitcoin-700' : 'text-slate-600'}`}
                >
                  {n.label}
                </a>
              ))}
            </nav>
            <div class="text-sm text-slate-500">{me ? <span>Hi, {me.name.split(' ')[0]}</span> : <a class="hover:text-bitcoin-700" href="/join">Register</a>}</div>
          </div>
        </header>

        <main class="mx-auto max-w-5xl px-4 py-8">
          {flash && (
            <div
              class={`mb-6 rounded-xl border p-3 text-sm ${
                flash.kind === 'error'
                  ? 'border-red-200 bg-red-50 text-red-700'
                  : 'border-green-200 bg-green-50 text-green-800'
              }`}
            >
              {flash.message}
            </div>
          )}
          {children}
        </main>

        <footer class="mx-auto max-w-5xl px-4 py-10 text-sm text-slate-500">
          <p>
            {EVENT.name} · {EVENT.dates} · {EVENT.location}
          </p>
          <p class="mt-1">
            Non-custodial is a hard gate. Self-sovereign or nothing. ·{' '}
            <a class="hover:text-bitcoin-700" href="/admin">Admin</a>
          </p>
        </footer>
      </body>
    </html>
  );
};

export const StatusBadge: FC<{ status: string }> = ({ status }) => {
  const styles: Record<string, string> = {
    open: 'bg-green-100 text-green-800',
    full: 'bg-slate-200 text-slate-700',
    frozen: 'bg-blue-100 text-blue-800',
  };
  return <span class={`badge capitalize ${styles[status] ?? 'bg-slate-100 text-slate-700'}`}>{status}</span>;
};
