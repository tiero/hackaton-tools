import './globals.css';
import Link from 'next/link';
import { EVENT } from '@/lib/event';
export const metadata = { title: EVENT.name, description: 'Async team formation for the Plan ₿ Summer School Hackathon' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-5 gap-y-2 px-4 py-4">
            <Link className="font-bold text-orange-600" href="/">₿ Hackathon Teams</Link>
            <Link className="text-slate-600 hover:text-slate-900" href="/people">People</Link>
            <Link className="text-slate-600 hover:text-slate-900" href="/ideas/new">Pitch an Idea</Link>
            <Link className="text-slate-600 hover:text-slate-900" href="/me">My Profile</Link>
            <Link className="text-slate-600 hover:text-slate-900" href="/about">Program</Link>
            <Link className="ml-auto text-slate-400 hover:text-slate-700" href="/admin">Admin</Link>
          </div>
        </nav>
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        <footer className="mx-auto max-w-6xl px-4 py-8 text-sm text-slate-400">
          {EVENT.name} · {EVENT.dates} · {EVENT.location}
        </footer>
      </body>
    </html>
  );
}
