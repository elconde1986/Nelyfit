import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive seed...');

  // Hash password for all users
  const hashedPassword = await bcrypt.hash('demo', 10);

  // ============================================
  // CREATE ADMIN USER
  // ============================================
  const admin = await prisma.user.upsert({
    where: { email: 'admin@nelsyfit.demo' },
    update: {},
    create: {
      email: 'admin@nelsyfit.demo',
      name: 'Admin User',
      role: 'ADMIN',
      password: hashedPassword,
      authProvider: 'EMAIL',
      emailVerified: true,
    },
  });
  console.log('✅ Admin user created');

  // ============================================
  // CREATE COACHES
  // ============================================
  const coach1 = await prisma.user.upsert({
    where: { email: 'coach@nelsyfit.demo' },
    update: {},
    create: {
      email: 'coach@nelsyfit.demo',
      name: 'Demo Coach',
      role: 'COACH',
      password: hashedPassword,
      authProvider: 'EMAIL',
      emailVerified: true,
    },
  });

  const coach2 = await prisma.user.upsert({
    where: { email: 'coach2@nelsyfit.demo' },
    update: {},
    create: {
      email: 'coach2@nelsyfit.demo',
      name: 'Sarah Johnson',
      role: 'COACH',
      password: hashedPassword,
      authProvider: 'EMAIL',
      emailVerified: true,
    },
  });
  console.log('✅ Coaches created');

  // ============================================
  // CREATE CLIENTS WITH PROFILES
  // ============================================
  const clientsData = [
    {
      email: 'client@nelsyfit.demo',
      name: 'Demo Client',
      preferredLang: 'en',
      streakDays: 7,
      level: 5,
      xp: 1250,
      totalWorkouts: 12,
      totalHabits: 45,
      badges: ['7_day_streak', '10_workouts'],
    },
    {
      email: 'client2@nelsyfit.demo',
      name: 'Maria Garcia',
      preferredLang: 'es',
      streakDays: 3,
      level: 2,
      xp: 350,
      totalWorkouts: 5,
      totalHabits: 18,
      badges: [],
    },
    {
      email: 'client3@nelsyfit.demo',
      name: 'John Smith',
      preferredLang: 'en',
      streakDays: 14,
      level: 8,
      xp: 3200,
      totalWorkouts: 28,
      totalHabits: 98,
      badges: ['7_day_streak', '10_workouts', '100_habits'],
    },
    {
      email: 'client4@nelsyfit.demo',
      name: 'Emma Wilson',
      preferredLang: 'en',
      streakDays: 1,
      level: 1,
      xp: 50,
      totalWorkouts: 1,
      totalHabits: 3,
      badges: [],
    },
  ];

  const createdClients = [];
  for (const clientData of clientsData) {
    const client = await prisma.client.upsert({
      where: { email: clientData.email },
      update: {},
      create: {
        name: clientData.name,
        email: clientData.email,
        preferredLang: clientData.preferredLang,
        coachId: coach1.id,
        gamification: {
          create: {
            xp: clientData.xp,
            level: clientData.level,
            streakDays: clientData.streakDays,
            bestStreak: clientData.streakDays,
            totalWorkouts: clientData.totalWorkouts,
            totalHabits: clientData.totalHabits,
            badges: clientData.badges,
            lastActiveDate: new Date(),
          },
        },
      },
    });

    const user = await prisma.user.upsert({
      where: { email: clientData.email },
      update: {},
      create: {
        email: clientData.email,
        name: clientData.name,
        role: 'CLIENT',
        password: hashedPassword,
        authProvider: 'EMAIL',
        emailVerified: true,
        clientId: client.id,
        profile: {
          create: {
            height: 170 + Math.floor(Math.random() * 30),
            weight: 60 + Math.floor(Math.random() * 30),
            fitnessGoal: ['Weight Loss', 'Muscle Gain', 'General Fitness', 'Endurance'][Math.floor(Math.random() * 4)],
            experienceLevel: ['Beginner', 'Intermediate', 'Advanced'][Math.floor(Math.random() * 3)],
          },
        },
      },
    });

    await prisma.client.update({
      where: { id: client.id },
      data: { userId: user.id },
    });

    createdClients.push({ client, user });
  }
  console.log('✅ Clients created with profiles');

  // ============================================
  // CREATE WORKOUTS
  // ============================================
  const workouts = [
    {
      name: 'Full Body Intro',
      description: 'Simple full body strength session for beginners.',
      exercises: [
        { name: 'Squats', sets: 3, reps: 10, restSeconds: 60 },
        { name: 'Push-ups', sets: 3, reps: 8, restSeconds: 45 },
        { name: 'Rows', sets: 3, reps: 10, restSeconds: 60 },
        { name: 'Plank', sets: 3, durationSeconds: 30, restSeconds: 30 },
      ],
    },
    {
      name: 'Upper Body Focus',
      description: 'Push & pull focus for upper body strength.',
      exercises: [
        { name: 'Bench Press', sets: 4, reps: 8, weight: 60, restSeconds: 90 },
        { name: 'Pull-ups', sets: 3, reps: 6, restSeconds: 90 },
        { name: 'Shoulder Press', sets: 3, reps: 10, weight: 20, restSeconds: 60 },
        { name: 'Bicep Curls', sets: 3, reps: 12, weight: 15, restSeconds: 45 },
      ],
    },
    {
      name: 'Lower Body Focus',
      description: 'Leg day basics for lower body strength.',
      exercises: [
        { name: 'Deadlifts', sets: 4, reps: 5, weight: 80, restSeconds: 120 },
        { name: 'Lunges', sets: 3, reps: 12, restSeconds: 60 },
        { name: 'Leg Press', sets: 3, reps: 15, weight: 100, restSeconds: 90 },
        { name: 'Calf Raises', sets: 3, reps: 20, restSeconds: 30 },
      ],
    },
    {
      name: 'Cardio Blast',
      description: 'High-intensity cardio workout.',
      exercises: [
        { name: 'Burpees', sets: 3, reps: 10, restSeconds: 60 },
        { name: 'Jumping Jacks', sets: 3, durationSeconds: 45, restSeconds: 30 },
        { name: 'Mountain Climbers', sets: 3, durationSeconds: 30, restSeconds: 30 },
        { name: 'High Knees', sets: 3, durationSeconds: 30, restSeconds: 30 },
      ],
    },
    {
      name: 'Core Strength',
      description: 'Focus on core stability and strength.',
      exercises: [
        { name: 'Plank', sets: 3, durationSeconds: 60, restSeconds: 30 },
        { name: 'Russian Twists', sets: 3, reps: 20, restSeconds: 30 },
        { name: 'Leg Raises', sets: 3, reps: 15, restSeconds: 30 },
        { name: 'Bicycle Crunches', sets: 3, reps: 20, restSeconds: 30 },
      ],
    },
  ];

  const createdWorkouts = [];
  for (const workoutData of workouts) {
    const workout = await prisma.workout.create({
      data: {
        name: workoutData.name,
        description: workoutData.description,
        coachId: coach1.id,
        goal: 'STRENGTH',
        difficulty: 'INTERMEDIATE',
        trainingEnvironment: 'GYM',
        estimatedDuration: 45,
        sessionTypes: ['STRENGTH'],
        tags: ['full-body', 'strength'],
        visibility: 'PRIVATE',
        exercises: {
          create: workoutData.exercises.map((ex: any) => ({
            name: ex.name,
            sets: ex.sets,
            reps: ex.reps || null,
            durationSeconds: ex.durationSeconds || null,
            restSeconds: ex.restSeconds || 60,
            weight: ex.weight || null,
            canSwap: true,
          })),
        },
      },
    });
    createdWorkouts.push(workout);
  }
  console.log('✅ Legacy workouts created');

  // Create a sample workout with new structure (sections, blocks, exercises)
  const structuredWorkout = await prisma.workout.create({
    data: {
      name: 'Full Body Strength Builder',
      description: 'A comprehensive full-body workout focusing on strength and muscle building.',
      coachId: coach1.id,
      goal: 'STRENGTH',
      difficulty: 'INTERMEDIATE',
      trainingEnvironment: 'GYM',
      estimatedDuration: 60,
      sessionTypes: ['STRENGTH'],
      tags: ['full-body', 'strength', 'beginner-friendly'],
      visibility: 'PRIVATE',
      sections: {
        create: [
          {
            name: 'Warm-up',
            order: 0,
            notes: '5-10 minutes of light cardio and dynamic stretching',
            blocks: {
              create: [
                {
                  type: 'CUSTOM',
                  title: 'Dynamic Warm-up',
                  order: 0,
                  exercises: {
                    create: [
                      {
                        name: 'Light Jogging',
                        targetRepsBySet: [1],
                        order: 0,
                      },
                      {
                        name: 'Arm Circles',
                        targetRepsBySet: [10, 10],
                        order: 1,
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            name: 'Main Workout',
            order: 1,
            notes: 'Rest 90 seconds between sets',
            blocks: {
              create: [
                {
                  type: 'STANDARD_SETS_REPS',
                  title: 'Block A: Upper Body',
                  order: 0,
                  exercises: {
                    create: [
                      {
                        name: 'Barbell Bench Press',
                        category: 'Push',
                        equipment: 'Barbell',
                        notes: 'Focus on controlled movement',
                        targetRepsBySet: [8, 8, 6],
                        targetWeightBySet: [60, 65, 70],
                        order: 0,
                      },
                      {
                        name: 'Bent Over Rows',
                        category: 'Pull',
                        equipment: 'Barbell',
                        notes: 'Keep back straight',
                        targetRepsBySet: [10, 10, 8],
                        targetWeightBySet: [50, 55, 60],
                        order: 1,
                      },
                    ],
                  },
                },
                {
                  type: 'STANDARD_SETS_REPS',
                  title: 'Block B: Lower Body',
                  order: 1,
                  exercises: {
                    create: [
                      {
                        name: 'Barbell Squats',
                        category: 'Squat',
                        equipment: 'Barbell',
                        notes: 'Go below parallel',
                        targetRepsBySet: [8, 8, 6],
                        targetWeightBySet: [80, 85, 90],
                        order: 0,
                      },
                      {
                        name: 'Romanian Deadlifts',
                        category: 'Hinge',
                        equipment: 'Barbell',
                        notes: 'Feel the stretch in hamstrings',
                        targetRepsBySet: [10, 10, 8],
                        targetWeightBySet: [60, 65, 70],
                        order: 1,
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            name: 'Cool-down',
            order: 2,
            notes: '5 minutes of static stretching',
            blocks: {
              create: [
                {
                  type: 'CUSTOM',
                  title: 'Stretching',
                  order: 0,
                  exercises: {
                    create: [
                      {
                        name: 'Quad Stretch',
                        targetRepsBySet: [1],
                        order: 0,
                      },
                      {
                        name: 'Hamstring Stretch',
                        targetRepsBySet: [1],
                        order: 1,
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });
  createdWorkouts.push(structuredWorkout);
  console.log('✅ Structured workout created with sections, blocks, and exercises');

  // ============================================
  // CREATE PROGRAMS
  // ============================================
  const program = await prisma.program.create({
    data: {
      name: '4-Week General Fitness',
      goal: '3x/week strength with lifestyle habits.',
      coachId: coach1.id,
      weeks: {
        create: [
          { weekNumber: 1, title: 'Foundation Week', notes: 'Focus on form and consistency' },
          { weekNumber: 2, title: 'Building Strength', notes: 'Increase intensity gradually' },
          { weekNumber: 3, title: 'Progressive Overload', notes: 'Challenge yourself more' },
          { weekNumber: 4, title: 'Peak Performance', notes: 'Push your limits' },
        ],
      },
    },
  });

  // Create program days (4 weeks = 28 days)
  const programDays = [];
  let dayIndex = 1;
  for (let week = 1; week <= 4; week++) {
    // Week structure: Mon, Wed, Fri workouts, rest days in between
    const workoutDays = [1, 3, 5]; // Monday, Wednesday, Friday
    const workoutTypes = ['Full Body Intro', 'Upper Body Focus', 'Lower Body Focus'];
    
    for (let day = 1; day <= 7; day++) {
      const isWorkoutDay = workoutDays.includes(day);
      const workoutIndex = workoutDays.indexOf(day);
      
      programDays.push({
        programId: program.id,
        dayIndex: dayIndex++,
        title: isWorkoutDay 
          ? `Day ${dayIndex - 1}: ${workoutTypes[workoutIndex % workoutTypes.length]}`
          : `Day ${dayIndex - 1}: Recovery`,
        workoutId: isWorkoutDay 
          ? createdWorkouts[workoutIndex % createdWorkouts.length].id 
          : null,
        isRestDay: !isWorkoutDay,
        notes: isWorkoutDay ? 'Focus on form and breathing' : 'Light movement, stretching, or complete rest',
      });
    }
  }

  await prisma.programDay.createMany({ data: programDays });
  console.log('✅ Program created with 28 days');

  // Assign program to first client
  await prisma.client.update({
    where: { id: createdClients[0].client.id },
    data: {
      currentProgramId: program.id,
      programStartDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Started 7 days ago
    },
  });

  // ============================================
  // CREATE COMPLETION LOGS
  // ============================================
  const mainClient = createdClients[0].client;
  const today = new Date();
  
  // Create completion logs for last 7 days
  for (let i = 6; i >= 0; i--) {
    const logDate = new Date(today);
    logDate.setDate(logDate.getDate() - i);
    
    await prisma.completionLog.upsert({
      where: {
        id: `log-${mainClient.id}-${logDate.toISOString().split('T')[0]}`,
      },
      update: {},
      create: {
        clientId: mainClient.id,
        date: logDate,
        workoutCompleted: i % 2 === 0, // Every other day
        habitsCompleted: i % 2 === 0 
          ? ['water', 'steps', 'sleep']
          : ['water', 'steps'],
      },
    });
  }
  console.log('✅ Completion logs created');

  // ============================================
  // CREATE CHAT MESSAGES
  // ============================================
  const messages = [
    { sender: 'COACH', content: 'Welcome to NelsyFit! Ready to start your fitness journey? 💪' },
    { sender: 'CLIENT', content: 'Yes! Excited to get started!' },
    { sender: 'COACH', content: 'Great! Remember to focus on form over speed. You got this! 🔥' },
    { sender: 'CLIENT', content: 'Thanks for the encouragement!' },
    { sender: 'COACH', content: 'I noticed you completed 7 days in a row - amazing streak! Keep it up! 🎉' },
  ];

  for (const msg of messages) {
    await prisma.chatMessage.create({
      data: {
        coachId: coach1.id,
        clientId: mainClient.id,
        sender: msg.sender as any,
        content: msg.content,
        readAt: msg.sender === 'COACH' ? null : new Date(),
        createdAt: new Date(Date.now() - (messages.length - messages.indexOf(msg)) * 60 * 60 * 1000),
      },
    });
  }
  console.log('✅ Chat messages created');

  // ============================================
  // CREATE NOTIFICATIONS
  // ============================================
  await prisma.notification.createMany({
    data: [
      {
        clientId: mainClient.id,
        coachId: coach1.id,
        type: 'GENERAL',
        title: 'Welcome to NelsyFit!',
        body: 'Your fitness journey starts today. Complete your first workout to earn XP!',
      },
      {
        clientId: mainClient.id,
        coachId: coach1.id,
        type: 'NUDGE',
        title: 'Keep your streak going! 🔥',
        body: 'You have a 7-day streak! Complete today\'s workout to make it 8 days!',
      },
      {
        clientId: mainClient.id,
        type: 'SYSTEM',
        title: 'Level Up! 🎉',
        body: 'Congratulations! You reached Level 5!',
      },
    ],
  });
  console.log('✅ Notifications created');

  // ============================================
  // CREATE PROGRAM TEMPLATES
  // ============================================
  const templates = [
    {
      name: 'Beginner Strength Program',
      description: 'Perfect for those new to strength training',
      goal: 'Build foundational strength',
      weeks: 4,
      visibility: 'PUBLIC',
      tags: ['beginner', 'strength', 'full-body'],
    },
    {
      name: 'Advanced Powerlifting',
      description: 'For experienced lifters looking to increase max strength',
      goal: 'Increase 1RM on big lifts',
      weeks: 12,
      visibility: 'TEAM',
      tags: ['advanced', 'powerlifting', 'strength'],
    },
    {
      name: 'Fat Loss Circuit',
      description: 'High-intensity circuit training for fat loss',
      goal: 'Burn fat and build lean muscle',
      weeks: 6,
      visibility: 'PRIVATE',
      tags: ['fat-loss', 'cardio', 'hiit'],
    },
  ];

  for (const templateData of templates) {
    const template = await prisma.programTemplate.create({
      data: {
        ...templateData,
        ownerId: coach1.id,
        visibility: templateData.visibility as any,
        days: {
          create: Array.from({ length: templateData.weeks * 7 }, (_, i) => ({
            dayIndex: i + 1,
            title: `Day ${i + 1}`,
            workoutRole: i % 3 === 0 ? 'RECOVERY' : 'FULL_BODY',
            isRestDay: i % 3 === 0,
          })),
        },
      },
    });
  }
  console.log('✅ Program templates created');

  // ============================================
  // CREATE TEMPORARY ACCESS CODES
  // ============================================
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 30);

  // Delete existing codes first to avoid conflicts
  await prisma.temporaryCodeRedemption.deleteMany({});
  await prisma.temporaryCode.deleteMany({});
  
  await prisma.temporaryCode.createMany({
    data: [
      {
        code: 'TRIAL2024',
        type: 'TRIAL_CODE',
        expiresAt: futureDate,
        maxUses: 100,
        assignedTier: 'PREMIUM_MONTHLY',
        trialDays: 7,
        createdById: admin.id,
      },
      {
        code: 'COACH2024',
        type: 'COACH_INVITE',
        expiresAt: futureDate,
        maxUses: 50,
        assignedTier: 'PREMIUM_MONTHLY',
        createdById: admin.id,
      },
      {
        code: 'CORP2024',
        type: 'CORPORATE_WELLNESS',
        expiresAt: futureDate,
        maxUses: 200,
        assignedTier: 'PREMIUM_ANNUAL',
        trialDays: 14,
        createdById: admin.id,
      },
    ],
  });
  console.log('✅ Temporary access codes created');

  // ============================================
  // CREATE SUBSCRIPTIONS & PAYMENTS
  // ============================================
  // Create active subscription for client 3
  const premiumClient = createdClients[2];
  // Delete existing subscription for this user first
  await prisma.subscription.deleteMany({
    where: { userId: premiumClient.user.id },
  });

  const subscription = await prisma.subscription.create({
    data: {
      userId: premiumClient.user.id,
      tier: 'PREMIUM_MONTHLY',
      status: 'ACTIVE',
      stripeSubscriptionId: `sub_test_${Date.now()}`, // Unique ID
      stripePriceId: 'price_monthly',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      payments: {
        create: [
          {
            userId: premiumClient.user.id,
            amount: 2999,
            currency: 'usd',
            status: 'SUCCEEDED',
            stripePaymentIntentId: 'pi_test_123',
            stripeInvoiceId: 'in_test_123',
          },
        ],
      },
    },
  });

  await prisma.user.update({
    where: { id: premiumClient.user.id },
    data: {
      subscriptionTier: 'PREMIUM_MONTHLY',
      subscriptionStatus: 'ACTIVE',
      stripeCustomerId: 'cus_test_123',
      stripeSubscriptionId: subscription.id,
    },
  });
  console.log('✅ Subscriptions and payments created');

  // ============================================
  // CREATE WORKOUT LOGS
  // ============================================
  for (let i = 0; i < 5; i++) {
    const logDate = new Date();
    logDate.setDate(logDate.getDate() - i);
    
    await prisma.workoutLog.create({
      data: {
        userId: createdClients[0].user.id,
        workoutId: createdWorkouts[i % createdWorkouts.length].id,
        date: logDate,
        completed: true,
        duration: 1800 + Math.floor(Math.random() * 600), // 30-40 minutes
        notes: 'Great session!',
        exerciseLogs: {
          create: [
            {
              exerciseName: 'Squats',
              sets: 3,
              reps: 10,
              weight: 60,
              restSeconds: 60,
            },
            {
              exerciseName: 'Push-ups',
              sets: 3,
              reps: 8,
              restSeconds: 45,
            },
          ],
        },
      },
    });
  }
  console.log('✅ Workout logs created');

  // ============================================
  // CREATE BODY MEASUREMENTS
  // ============================================
  for (let i = 0; i < 3; i++) {
    const measureDate = new Date();
    measureDate.setDate(measureDate.getDate() - (i * 7));
    
    await prisma.bodyMeasurement.create({
      data: {
        userId: createdClients[0].user.id,
        date: measureDate,
        weight: 70 - (i * 0.5),
        bodyFat: 20 - (i * 0.3),
        muscleMass: 50 + (i * 0.2),
        chest: 100 + (i * 1),
        waist: 85 - (i * 0.5),
        hips: 95,
        arms: 30 + (i * 0.2),
        thighs: 55 + (i * 0.3),
      },
    });
  }
  console.log('✅ Body measurements created');

  // ============================================
  // CREATE MEAL PLANS
  // ============================================
  const mealPlan = await prisma.mealPlan.create({
    data: {
      userId: createdClients[0].user.id,
      name: 'Balanced Nutrition Plan',
      calories: 2000,
      protein: 150,
      carbs: 200,
      fats: 65,
      fiber: 30,
      startDate: new Date(),
      meals: {
        create: [
          {
            name: 'Oatmeal with Berries',
            mealType: 'breakfast',
            calories: 400,
            protein: 15,
            carbs: 60,
            fats: 10,
            ingredients: ['oats', 'blueberries', 'almond milk', 'honey'],
          },
          {
            name: 'Grilled Chicken Salad',
            mealType: 'lunch',
            calories: 500,
            protein: 40,
            carbs: 30,
            fats: 20,
            ingredients: ['chicken breast', 'mixed greens', 'olive oil', 'vegetables'],
          },
          {
            name: 'Salmon with Quinoa',
            mealType: 'dinner',
            calories: 600,
            protein: 45,
            carbs: 50,
            fats: 25,
            ingredients: ['salmon', 'quinoa', 'broccoli', 'lemon'],
          },
        ],
      },
    },
  });
  console.log('✅ Meal plans created');

  // ============================================
  // CREATE COMMUNITY GROUPS
  // ============================================
  const group = await prisma.group.create({
    data: {
      name: 'NelsyFit Community',
      description: 'Join our community of fitness enthusiasts!',
      isPublic: true,
      members: {
        create: [
          {
            userId: createdClients[0].user.id,
            role: 'admin',
          },
          {
            userId: createdClients[1].user.id,
            role: 'member',
          },
        ],
      },
      challenges: {
        create: [
          {
            name: '30-Day Challenge',
            description: 'Complete 30 workouts in 30 days!',
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            goal: 'Complete 30 workouts',
            participants: {
              create: [
                {
                  userId: createdClients[0].user.id,
                  progress: 12,
                  rank: 1,
                },
                {
                  userId: createdClients[1].user.id,
                  progress: 5,
                  rank: 2,
                },
              ],
            },
          },
        ],
      },
    },
  });
  console.log('✅ Community groups and challenges created');

  // ============================================
  // CREATE COACH NOTES
  // ============================================
  await prisma.coachNote.createMany({
    data: [
      {
        coachId: coach1.id,
        clientId: mainClient.id,
        message: 'Client showing great progress. Consider increasing workout intensity next week.',
        autoSuggested: false,
        resolved: false,
      },
      {
        coachId: coach1.id,
        clientId: mainClient.id,
        message: '7-day streak achieved! Send encouragement message.',
        autoSuggested: true,
        resolved: true,
      },
    ],
  });
  console.log('✅ Coach notes created');

  // ============================================
  // CREATE SAMPLE WORKOUT SESSION
  // ============================================
  const mainClientUser = await prisma.user.findUnique({
    where: { email: 'client@nelsyfit.demo' },
  });

  if (mainClientUser && structuredWorkout) {
    const workoutSession = await prisma.workoutSession.create({
      data: {
        clientId: mainClientUser.id,
        workoutId: structuredWorkout.id,
        dateTimeStarted: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        dateTimeCompleted: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000), // 45 min later
        status: 'COMPLETED',
        clientNotes: 'Great workout! Felt strong today.',
      },
    });

    // Get exercises from the structured workout
    const workoutExercises = await prisma.workoutExercise.findMany({
      where: {
        block: {
          section: {
            workoutId: structuredWorkout.id,
          },
        },
      },
      orderBy: [
        { block: { section: { order: 'asc' } } },
        { block: { order: 'asc' } },
        { order: 'asc' },
      ],
    });

    // Create set logs for the first exercise (Bench Press)
    const benchPress = workoutExercises.find((e: any) => e.name === 'Barbell Bench Press');
    if (benchPress) {
      await prisma.exerciseSetLog.createMany({
        data: [
          {
            sessionId: workoutSession.id,
            workoutExerciseId: benchPress.id,
            exerciseName: benchPress.name,
            setNumber: 1,
            targetReps: 8,
            targetWeight: 60,
            actualReps: 8,
            actualWeight: 60,
            feelingCode: 'GOOD_CHALLENGE',
            feelingEmoji: '🙂',
          },
          {
            sessionId: workoutSession.id,
            workoutExerciseId: benchPress.id,
            exerciseName: benchPress.name,
            setNumber: 2,
            targetReps: 8,
            targetWeight: 65,
            actualReps: 8,
            actualWeight: 65,
            feelingCode: 'GOOD_CHALLENGE',
            feelingEmoji: '🙂',
          },
          {
            sessionId: workoutSession.id,
            workoutExerciseId: benchPress.id,
            exerciseName: benchPress.name,
            setNumber: 3,
            targetReps: 6,
            targetWeight: 70,
            actualReps: 5,
            actualWeight: 70,
            feelingCode: 'HARD',
            feelingEmoji: '😓',
            feelingNote: 'Last rep was tough',
          },
        ],
      });
    }

    console.log('✅ Sample workout session created with set logs');
  }

  console.log('\n🎉 Comprehensive seed completed successfully!');
  console.log('\n📋 Test Accounts:');
  console.log('  Admin: admin@nelsyfit.demo / demo');
  console.log('  Coach: coach@nelsyfit.demo / demo');
  console.log('  Client 1: client@nelsyfit.demo / demo (7-day streak, Level 5)');
  console.log('  Client 2: client2@nelsyfit.demo / demo (Spanish, 3-day streak)');
  console.log('  Client 3: client3@nelsyfit.demo / demo (14-day streak, Premium)');
  console.log('  Client 4: client4@nelsyfit.demo / demo (New user)');
  console.log('\n🔑 Access Codes:');
  console.log('  TRIAL2024 - 7-day trial code');
  console.log('  COACH2024 - Coach invite code');
  console.log('  CORP2024 - Corporate wellness code');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error('❌ Seed error:', e);
    return prisma.$disconnect().finally(() => process.exit(1));
  });
