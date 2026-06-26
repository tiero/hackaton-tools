import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isAdmin } from '@/lib/actions';
const esc = (v: any) => `"${String(v ?? '').replaceAll('"', '""')}"`;
export async function GET() {
  if (!(await isAdmin())) return new NextResponse('Unauthorized', { status: 401 });
  const ps = await prisma.participant.findMany({ include: { teamMember: { include: { idea: true } }, interests_: { include: { idea: true } } } });
  const rows = [
    ['name', 'email', 'skills', 'interests', 'contact', 'open to join', 'looking for', 'team title', 'interested in'],
    ...ps.map((p) => [
      p.name, p.email, p.skills, p.interests ?? '', p.contact ?? '',
      p.openToJoin ? 'yes' : 'no', p.lookingFor ?? '',
      p.teamMember?.idea.title ?? '',
      p.interests_.map((i) => i.idea.title).join('; '),
    ]),
  ];
  return new NextResponse(rows.map((r) => r.map(esc).join(',')).join('\n'), { headers: { 'content-type': 'text/csv', 'content-disposition': 'attachment; filename="participants.csv"' } });
}
