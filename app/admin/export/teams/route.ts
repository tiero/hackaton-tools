import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isAdmin } from '@/lib/actions';
const esc = (v: any) => `"${String(v ?? '').replaceAll('"', '""')}"`;
export async function GET() {
  if (!(await isAdmin())) return new NextResponse('Unauthorized', { status: 401 });
  const ideas = await prisma.idea.findMany({ include: { members: { include: { participant: true } } } });
  const rows = [['idea title', 'problem', 'needed skills', 'max team size', 'member name', 'member email', 'member skills', 'member contact', 'team role', 'motivation']];
  for (const i of ideas) {
    if (i.members.length === 0) rows.push([i.title, i.problem, i.neededSkills, String(i.maxTeamSize), '', '', '', '', '', '']);
    for (const m of i.members) rows.push([i.title, i.problem, i.neededSkills, String(i.maxTeamSize), m.participant.name, m.participant.email, m.participant.skills, m.participant.contact ?? '', m.role, m.motivation ?? '']);
  }
  return new NextResponse(rows.map((r) => r.map(esc).join(',')).join('\n'), { headers: { 'content-type': 'text/csv', 'content-disposition': 'attachment; filename="teams.csv"' } });
}
