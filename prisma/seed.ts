import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const coachEmail = 'coach@nelyfit.demo';
  const clientEmail = 'client@nelyfit.demo';

  const coach = await prisma.user.upsert({
    where: { email: coachEmail },
    update: {},
    create: {
      email: coachEmail,
      name: 'Demo Coach',
      role: 'COACH',
      password: 'demo',
    },
  });

  const client = await prisma.client.upsert({
    where: { email: clientEmail },
    update: {},
    create: {
      name: 'Demo Client',
      email: clientEmail,
      preferredLang: 'en',
    },
  });

  await prisma.user.upsert({
    where: { email: clientEmail },
    update: {},
    create: {
      email: clientEmail,
      name: 'Demo Client',
      role: 'CLIENT',
      password: 'demo',
      client: {
        connect: { id: client.id },
      },
    },
  });

  // link coach to client
  await prisma.client.update({
    where: { id: client.id },
    data: {
      coachId: coach.id,
    },
  });

  // create workouts
  const fullBody = await prisma.workout.create({
    data: {
      name: 'Full Body Intro',
      description: 'Simple full body strength session.',
      coachId: coach.id,
      exercises: {
        create: [
          { name: 'Squats', sets: 3, reps: 10 },
          { name: 'Push-ups', sets: 3, reps: 8 },
          { name: 'Rows', sets: 3, reps: 10 },
        ],
      },
    },
  });

  const upper = await prisma.workout.create({
    data: {
      name: 'Upper Body Focus',
      description: 'Push & pull focus.',
      coachId: coach.id,
      exercises: {
        create: [
          { name: 'Bench press', sets: 3, reps: 8 },
          { name: 'Pull-ups', sets: 3, reps: 6 },
        ],
      },
    },
  });

  const lower = await prisma.workout.create({
    data: {
      name: 'Lower Body Focus',
      description: 'Leg day basics.',
      coachId: coach.id,
      exercises: {
        create: [
          { name: 'Deadlifts', sets: 3, reps: 5 },
          { name: 'Lunges', sets: 3, reps: 8 },
        ],
      },
    },
  });

  // create program
  const program = await prisma.program.create({
    data: {
      name: '4-week General Fitness',
      goal: '3x/week strength with lifestyle habits.',
      coachId: coach.id,
    },
  });

  // attach workouts to program days (first week demo)
  await prisma.programDay.createMany({
    data: [
      {
        programId: program.id,
        dayIndex: 1,
        title: 'Full Body Kickoff',
        workoutId: fullBody.id,
        isRestDay: false,
      },
      {
        programId: program.id,
        dayIndex: 3,
        title: 'Upper Strength',
        workoutId: upper.id,
        isRestDay: false,
      },
      {
        programId: program.id,
        dayIndex: 5,
        title: 'Lower Strength',
        workoutId: lower.id,
        isRestDay: false,
      },
      {
        programId: program.id,
        dayIndex: 2,
        title: 'Recovery / light movement',
        workoutId: null,
        isRestDay: true,
      },
      {
        programId: program.id,
        dayIndex: 4,
        title: 'Recovery / light movement',
        workoutId: null,
        isRestDay: true,
      },
      {
        programId: program.id,
        dayIndex: 6,
        title: 'Recovery / light movement',
        workoutId: null,
        isRestDay: true,
      },
      {
        programId: program.id,
        dayIndex: 7,
        title: 'Recovery / light movement',
        workoutId: null,
        isRestDay: true,
      },
    ],
  });

  // assign program to client starting today
  await prisma.client.update({
    where: { id: client.id },
    data: {
      currentProgramId: program.id,
      programStartDate: new Date(),
    },
  });

  console.log('Seed completed.');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    return prisma.$disconnect().finally(() => process.exit(1));
  });
