'use client';
import { useEffect } from 'react';
import { useFormState } from 'react-dom';
import { saveParticipant } from '@/lib/actions';
const initial = { ok: false, message: '', id: '' } as Awaited<ReturnType<typeof saveParticipant>>;
export default function ParticipantForm({ participant }: { participant?: any }) {
  const [state, action] = useFormState(saveParticipant, initial);
  useEffect(()=>{ if(state.ok && state.id) localStorage.setItem('participantId', state.id); },[state]);
  return <form action={action} className="card space-y-4"><input type="hidden" name="id" defaultValue={participant?.id ?? ''}/><label className="block">Name<input className="input mt-1" name="name" defaultValue={participant?.name} required/></label><label className="block">Email<input className="input mt-1" name="email" type="email" defaultValue={participant?.email} required/></label><label className="block">Skills<textarea className="input mt-1" name="skills" defaultValue={participant?.skills} required/></label><label className="block">Interests<textarea className="input mt-1" name="interests" defaultValue={participant?.interests ?? ''}/></label><label className="block">Contact info<textarea className="input mt-1" name="contact" defaultValue={participant?.contact ?? ''}/></label><button className="btn">Save profile</button>{state.message && <p className={state.ok?'text-green-700':'text-red-700'}>{state.message}{state.ok && ' You can now propose or join teams.'}</p>}</form>;
}
