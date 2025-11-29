import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkWorkout() {
  console.log('🔍 Checking "Upper Body Focus" workout details...\n');
  
  // Find all workouts with this name
  const workouts = await prisma.workout.findMany({
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
  });

  console.log(`Found ${workouts.length} workout(s) with name "Upper Body Focus"\n`);

  for (const workout of workouts) {
    console.log(`Workout ID: ${workout.id}`);
    console.log(`Coach ID: ${workout.coachId}`);
    console.log(`Sections: ${workout.sections.length}`);
    
    if (workout.sections.length > 0) {
      workout.sections.forEach((section: any, sIdx: number) => {
        console.log(`\n  Section ${sIdx + 1}: ${section.name} (order: ${section.order})`);
        console.log(`    Blocks: ${section.blocks?.length || 0}`);
        
        if (section.blocks && section.blocks.length > 0) {
          section.blocks.forEach((block: any, bIdx: number) => {
            console.log(`      Block ${bIdx + 1}: ${block.title || block.type} (order: ${block.order})`);
            console.log(`        Exercises: ${block.exercises?.length || 0}`);
            
            if (block.exercises && block.exercises.length > 0) {
              block.exercises.forEach((ex: any, eIdx: number) => {
                console.log(`          ${eIdx + 1}. ${ex.name} (order: ${ex.order})`);
              });
            }
          });
        }
      });
    } else {
      console.log('  ⚠️ No sections found!');
    }
    
    console.log('\n---\n');
  }

  await prisma.$disconnect();
}

checkWorkout().catch(console.error);

