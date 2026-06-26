import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
export async function GET(_: Request, { params }: { params: { id: string } }) {
  const p = await prisma.participant.findUnique({
    where: { id: params.id },
    include: { teamMember: { include: { idea: true } }, interests_: { include: { idea: true } } },
  });
  return p ? NextResponse.json(p) : new NextResponse('Not found', { status: 404 });
}
