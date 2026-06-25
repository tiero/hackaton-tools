'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import ParticipantForm from './ParticipantForm';
export default function MyProfileClient(){ const [p,setP]=useState<any>(null); const [missing,setMissing]=useState(false); useEffect(()=>{ const id=localStorage.getItem('participantId'); if(!id){setMissing(true);return;} fetch(`/api/participants/${id}`).then(r=>r.ok?r.json():null).then(x=>x?setP(x):setMissing(true)); },[]); if(missing) return <div className="card"><p className="mb-4">No participant profile found in this browser.</p><Link className="btn" href="/join">Register / Edit My Profile</Link></div>; if(!p) return <p className="card">Loading profile…</p>; return <div className="space-y-4"><ParticipantForm participant={p}/>{p.teamMember && <div className="card"><b>Current team:</b> {p.teamMember.idea.title}</div>}</div>; }
