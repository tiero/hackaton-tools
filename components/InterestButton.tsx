'use client';
import { useEffect, useState } from 'react';

export default function InterestButton({ ideaId, action }: { ideaId: string; action: (fd: FormData) => void }) {
  const [id, setId] = useState('');
  useEffect(() => setId(localStorage.getItem('participantId') || ''), []);
  if (!id) {
    return (
      <a className="btn-secondary" href="/join">Register to signal interest</a>
    );
  }
  return (
    <form action={action}>
      <input type="hidden" name="ideaId" value={ideaId} />
      <input type="hidden" name="participantId" value={id} />
      <button className="btn-secondary">👋 Toggle “I’m open to join this”</button>
    </form>
  );
}
