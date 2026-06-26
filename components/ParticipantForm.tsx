'use client';
import { useEffect } from 'react';
import { useFormState } from 'react-dom';
import { saveParticipant } from '@/lib/actions';
const initial = { ok: false, message: '', id: '' } as Awaited<ReturnType<typeof saveParticipant>>;
export default function ParticipantForm({ participant }: { participant?: any }) {
  const [state, action] = useFormState(saveParticipant, initial);
  useEffect(() => {
    if (state.ok && state.id) localStorage.setItem('participantId', state.id);
  }, [state]);
  return (
    <form action={action} className="card space-y-4">
      <input type="hidden" name="id" defaultValue={participant?.id ?? ''} />
      <label className="block">Name<input className="input mt-1" name="name" defaultValue={participant?.name} required /></label>
      <label className="block">Email<input className="input mt-1" name="email" type="email" defaultValue={participant?.email} required /></label>
      <label className="block">Skills<textarea className="input mt-1" name="skills" defaultValue={participant?.skills} placeholder="e.g. Rust, Lightning, React, design, product" required /></label>
      <label className="block">Interests<textarea className="input mt-1" name="interests" defaultValue={participant?.interests ?? ''} placeholder="What in Bitcoin excites you" /></label>
      <label className="block">What are you looking for?<textarea className="input mt-1" name="lookingFor" defaultValue={participant?.lookingFor ?? ''} placeholder="e.g. Looking to join a wallet/privacy team — can build backend" /></label>
      <label className="flex items-center gap-2">
        <input type="checkbox" name="openToJoin" value="true" defaultChecked={participant ? participant.openToJoin : true} />
        <span>I’m open to join a team (show me in the “open to join” pool)</span>
      </label>
      <label className="block">Contact info<textarea className="input mt-1" name="contact" defaultValue={participant?.contact ?? ''} placeholder="Telegram / Signal / email so teammates can reach you" /></label>
      <button className="btn">Save profile</button>
      {state.message && (
        <p className={state.ok ? 'text-green-700' : 'text-red-700'}>
          {state.message}
          {state.ok && ' You can now pitch an idea or join a team.'}
        </p>
      )}
    </form>
  );
}
