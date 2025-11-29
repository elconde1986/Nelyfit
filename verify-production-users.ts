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

  // Check workout - find the one WITH exercises (not legacy empty ones)
  const allWorkouts = await prisma.workout.findMany({
    where: { name: 'Upper Body Focus' },
    include: {
      sections: {
        include: {
          blocks: {
            include: {
              exercises: {
                orderBy: { order: 'asc' },
              },
            },
            orderBy: { order: 'asc' },
          },
        },
        orderBy: { order: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // Find the workout that actually has exercises
  const workout = allWorkouts.find((w: any) => {
    const exerciseCount = w.sections.reduce((sum: number, s: any) => 
      sum + (s.blocks?.reduce((blockSum: number, b: any) => blockSum + (b.exercises?.length || 0), 0) || 0), 0
    );
    return exerciseCount > 0;
  }) || null;

  if (workout) {
    const totalExercises = workout.sections?.reduce((sum: number, s: any) => 
      sum + (s.blocks?.reduce((blockSum: number, b: any) => blockSum + (b.exercises?.length || 0), 0) || 0), 0) || 0;
    console.log(`✅ Upper Body Focus workout found:`);
    console.log(`   - ID: ${workout.id}`);
    console.log(`   - Sections: ${workout.sections?.length || 0}`);
    console.log(`   - Total Exercises: ${totalExercises}`);
    
    // Show exercise details
    if (workout.sections && workout.sections.length > 0) {
      workout.sections.forEach((section: any, sIdx: number) => {
        console.log(`   - Section ${sIdx + 1}: ${section.name}`);
        if (section.blocks && section.blocks.length > 0) {
          section.blocks.forEach((block: any, bIdx: number) => {
            console.log(`     - Block ${bIdx + 1}: ${block.title || block.type}`);
            if (block.exercises && block.exercises.length > 0) {
              block.exercises.forEach((ex: any, eIdx: number) => {
                console.log(`       - Exercise ${eIdx + 1}: ${ex.name}`);
              });
            }
          });
        }
      });
    }
  } else {
    console.log(`❌ Upper Body Focus workout NOT FOUND`);
  }

  await prisma.$disconnect();
}

verifyUsers().catch(console.error);

