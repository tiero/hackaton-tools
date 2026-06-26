import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.appSetting.upsert({
    where: { key: 'teamFormationFrozen' },
    create: { key: 'teamFormationFrozen', value: 'false' },
    update: { value: 'false' },
  });

  const people = [
    { id: 'demo-nadia', name: 'Nadia Ortega', email: 'nadia@example.com', skills: 'Rust, Lightning, backend', interests: 'Self-custody, LSPs', contact: '@nadia', lookingFor: 'Want to build a non-custodial onboarding flow — can lead backend', openToJoin: true },
    { id: 'demo-tomas', name: 'Tomás Vidal', email: 'tomas@example.com', skills: 'React Native, mobile, design', interests: 'Privacy, UX', contact: 'Signal: tomas.01', lookingFor: 'Open to any wallet/privacy team — strong on mobile UX', openToJoin: true },
    { id: 'demo-lin', name: 'Lin Zhao', email: 'lin@example.com', skills: 'Cryptography, protocol, Python', interests: 'Identity primitives, FROST', contact: '@linz', lookingFor: 'Looking for an ambitious protocol-level idea', openToJoin: true },
    { id: 'demo-arto', name: 'Arto Salmi', email: 'arto@example.com', skills: 'Embedded, hardware, C', interests: 'Hardware signing, air-gap', contact: 'arto@example.com', lookingFor: 'Hardware-heavy idea preferred', openToJoin: true },
  ];
  for (const p of people) {
    await prisma.participant.upsert({ where: { id: p.id }, create: p, update: {} });
  }

  const existing = await prisma.idea.count();
  if (existing === 0) {
    await prisma.idea.create({
      data: {
        title: 'Pocket Onboard',
        problem: 'Onboarding the next billion means people with no bank, intermittent connectivity, and a hostile regulator. Most flows custody keys “just to get started.”',
        proposedSolution: 'A self-custodial, SMS/USSD-assisted onboarding that generates and keeps keys on-device from the first tap. No custody, ever.',
        neededSkills: 'Mobile, Lightning, UX, localization',
        maxTeamSize: 5,
        creatorParticipantId: 'demo-nadia',
        members: { create: { participantId: 'demo-nadia', role: 'Idea owner', motivation: 'Wants to lead backend / LSP integration.' } },
        comments: { create: { participantId: 'demo-tomas', body: 'I can own the mobile UX — keys on-device from tap one.' } },
        interested: { create: [{ participantId: 'demo-tomas' }, { participantId: 'demo-lin' }] },
      },
    });
    await prisma.idea.create({
      data: {
        title: 'KeyGuard',
        problem: 'Self-custody is only as strong as the seed backup. Hostile environments make paper backups dangerous.',
        proposedSolution: 'A distress-resistant, multi-share backup using FROST so no single share — or single coercion — reveals the key.',
        neededSkills: 'Cryptography, embedded, protocol',
        maxTeamSize: 4,
        creatorParticipantId: 'demo-lin',
        members: { create: { participantId: 'demo-lin', role: 'Idea owner', motivation: 'Protocol design and threshold crypto.' } },
        interested: { create: [{ participantId: 'demo-arto' }] },
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
