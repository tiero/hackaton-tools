import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main(){
  await prisma.appSetting.upsert({where:{key:'teamFormationFrozen'},create:{key:'teamFormationFrozen',value:'false'},update:{value:'false'}});
  const a=await prisma.participant.upsert({where:{id:'demo-alex'},create:{id:'demo-alex',name:'Alex Rivera',email:'alex@example.com',skills:'Product, frontend',interests:'Civic tech',contact:'@alex'},update:{}});
  const b=await prisma.participant.upsert({where:{id:'demo-sam'},create:{id:'demo-sam',name:'Sam Chen',email:'sam@example.com',skills:'Backend, data',interests:'Climate',contact:'@sam'},update:{}});
  await prisma.idea.create({data:{title:'Volunteer Matchmaker',problem:'Local groups struggle to match volunteers with time-sensitive needs.',proposedSolution:'A simple intake and matching board for organizers and volunteers.',neededSkills:'UX, Next.js, data modeling',maxTeamSize:4,creatorParticipantId:a.id,members:{create:{participantId:a.id,role:'Idea owner',motivation:'Wants to lead product and UI.'}},comments:{create:{participantId:b.id,body:'I can help with matching logic.'}}}}).catch(()=>{});
}
main().finally(()=>prisma.$disconnect());
