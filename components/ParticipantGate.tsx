'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
export function useParticipantId() { const [id,setId]=useState(''); useEffect(()=>setId(localStorage.getItem('participantId')||''),[]); return id; }
export default function ParticipantGate({ children }: { children: (id: string) => React.ReactNode }) { const id=useParticipantId(); if(!id) return <div className="card"><p className="mb-4">Register first so we know which participant is making this change.</p><Link className="btn" href="/join">Register / Edit My Profile</Link></div>; return <>{children(id)}</>; }
