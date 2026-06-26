'use client';
import { useFormState } from 'react-dom';
import { adminLogin } from '@/lib/actions';
const initial = { ok: false, message: '' };
export default function AdminLogin() {
  const [state, action] = useFormState(adminLogin, initial);
  return (
    <form action={action} className="card space-y-3">
      <label className="block">Password<input className="input mt-1" name="password" type="password" autoFocus /></label>
      {state.message && <p className="text-red-700">{state.message}</p>}
      <button className="btn">Enter admin</button>
    </form>
  );
}
