import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
const esc=(v:any)=>`"${String(v??'').replaceAll('"','""')}"`;
export async function GET(req: Request){ const url=new URL(req.url); if(url.searchParams.get('password')!==process.env.ADMIN_PASSWORD) return new NextResponse('Unauthorized',{status:401}); const ps=await prisma.participant.findMany({include:{teamMember:{include:{idea:true}}}}); const rows=[['name','email','skills','interests','contact','team title'], ...ps.map(p=>[p.name,p.email,p.skills,p.interests??'',p.contact??'',p.teamMember?.idea.title??''])]; return new NextResponse(rows.map(r=>r.map(esc).join(',')).join('\n'),{headers:{'content-type':'text/csv','content-disposition':'attachment; filename="participants.csv"'}}); }
