'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import ParticipantForm from './ParticipantForm';
export default function MyProfileClient() {
  const [p, setP] = useState<any>(null);
  const [missing, setMissing] = useState(false);
  useEffect(() => {
    const id = localStorage.getItem('participantId');
    if (!id) {
      setMissing(true);
      return;
    }
    fetch(`/api/participants/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((x) => (x ? setP(x) : setMissing(true)));
  }, []);
  if (missing)
    return (
      <div className="card">
        <p className="mb-4">No participant profile found in this browser.</p>
        <Link className="btn" href="/join">Register / Edit My Profile</Link>
      </div>
    );
  if (!p) return <p className="card">Loading profile…</p>;
  return (
    <div className="space-y-4">
      <ParticipantForm participant={p} />
      {p.teamMember && (
        <div className="card">
          <b>Committed team:</b>{' '}
          <Link className="text-orange-700 hover:underline" href={`/ideas/${p.teamMember.ideaId}`}>{p.teamMember.idea.title}</Link>{' '}
          · {p.teamMember.role}
        </div>
      )}
      {p.interests_?.length > 0 && (
        <div className="card">
          <b>Open to join (interest signalled):</b>
          <ul className="mt-2 flex flex-wrap gap-2">
            {p.interests_.map((i: any) => (
              <li key={i.id} className="chip">
                <Link href={`/ideas/${i.ideaId}`}>{i.idea.title}</Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
