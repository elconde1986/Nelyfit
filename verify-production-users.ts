import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyUsers() {
  console.log('🔍 Verifying production users...\n');
  
  const testEmails = [
    'admin@nelsyfit.demo',
    'coach@nelsyfit.demo',
    'client@nelsyfit.demo',
    'client2@nelsyfit.demo',
  ];

  for (const email of testEmails) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true,
        clientId: true,
      },
    });

    if (user) {
      console.log(`✅ ${email}:`);
      console.log(`   - Name: ${user.name}`);
      console.log(`   - Role: ${user.role}`);
      console.log(`   - Has Password: ${user.password ? 'YES' : 'NO'}`);
      console.log(`   - Password Length: ${user.password?.length || 0}`);
      console.log(`   - Client ID: ${user.clientId || 'N/A'}`);
      console.log('');
    } else {
      console.log(`❌ ${email}: NOT FOUND\n`);
    }
  }

  // Check workout
  const workout = await prisma.workout.findFirst({
    where: { name: 'Upper Body Focus' },
    include: {
      sections: {
        include: {
          blocks: {
            include: {
              exercises: true,
            },
          },
        },
      },
    },
  });

  if (workout) {
    const totalExercises = workout.sections?.reduce((sum: number, s: any) => 
      sum + (s.blocks?.reduce((blockSum: number, b: any) => blockSum + (b.exercises?.length || 0), 0) || 0), 0) || 0;
    console.log(`✅ Upper Body Focus workout found:`);
    console.log(`   - Sections: ${workout.sections?.length || 0}`);
    console.log(`   - Total Exercises: ${totalExercises}`);
  } else {
    console.log(`❌ Upper Body Focus workout NOT FOUND`);
  }

  await prisma.$disconnect();
}

verifyUsers().catch(console.error);

