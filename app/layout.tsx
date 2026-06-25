import './globals.css';
import Link from 'next/link';
export const metadata = { title: 'Hackathon Teams', description: 'Small hackathon team formation app' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><nav className="border-b bg-white"><div className="mx-auto flex max-w-6xl flex-wrap gap-3 px-4 py-4"><Link className="font-bold" href="/">Hackathon Teams</Link><Link href="/ideas/new">Propose Idea</Link><Link href="/me">My Profile</Link><Link href="/admin">Admin</Link></div></nav><main className="mx-auto max-w-6xl px-4 py-8">{children}</main></body></html>;
}
