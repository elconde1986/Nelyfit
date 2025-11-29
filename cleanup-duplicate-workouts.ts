import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanup() {
  console.log('🧹 Cleaning up duplicate "Upper Body Focus" workouts...\n');
  
  // Find all workouts with this name
  const workouts = await prisma.workout.findMany({
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
    orderBy: { createdAt: 'desc' }, // Most recent first
  });

  console.log(`Found ${workouts.length} workout(s) with name "Upper Body Focus"\n`);

  // Find the workout with sections and exercises
  const validWorkout = workouts.find((w: any) => {
    const exerciseCount = w.sections.reduce((sum: number, s: any) => 
      sum + (s.blocks?.reduce((blockSum: number, b: any) => blockSum + (b.exercises?.length || 0), 0) || 0), 0
    );
    return exerciseCount > 0;
  });

  if (!validWorkout) {
    console.log('❌ No valid workout found with exercises. Cannot clean up.');
    await prisma.$disconnect();
    return;
  }

  console.log(`✅ Keeping workout ID: ${validWorkout.id}`);
  console.log(`   Created: ${validWorkout.createdAt}`);
  const exerciseCount = validWorkout.sections.reduce((sum: number, s: any) => 
    sum + (s.blocks?.reduce((blockSum: number, b: any) => blockSum + (b.exercises?.length || 0), 0) || 0), 0
  );
  console.log(`   Exercises: ${exerciseCount}\n`);

  // Delete all other workouts
  const toDelete = workouts.filter((w: any) => w.id !== validWorkout.id);
  console.log(`🗑️  Deleting ${toDelete.length} duplicate workout(s)...\n`);

  for (const workout of toDelete) {
    try {
      await prisma.workout.delete({
        where: { id: workout.id },
      });
      console.log(`   ✅ Deleted: ${workout.id} (${workout.sections.length} sections)`);
    } catch (error: any) {
      console.log(`   ⚠️  Failed to delete ${workout.id}: ${error.message}`);
    }
  }

  console.log('\n✅ Cleanup complete!');
  await prisma.$disconnect();
}

cleanup().catch(console.error);

