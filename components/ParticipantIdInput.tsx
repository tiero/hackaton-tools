'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
export default function ParticipantIdInput() { const [id,setId]=useState(''); useEffect(()=>setId(localStorage.getItem('participantId')||''),[]); return <><input type="hidden" name="participantId" value={id}/>{!id && <p className="rounded-lg bg-amber-50 p-3 text-amber-800">No participant profile found in this browser. <Link className="underline" href="/join">Register first</Link>.</p>}</>; }
