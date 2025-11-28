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

  // ============================================
  // CREATE EXERCISE LIBRARY
  // ============================================
  const exerciseLibrary = [
    // Upper Body - Push
    { name: 'Barbell Bench Press', category: 'Strength', equipment: 'Barbell', musclesTargeted: ['Chest', 'Triceps', 'Shoulders'], notes: 'Keep your feet flat on the floor and maintain a slight arch in your back. Lower the bar to your chest with control.', isLibrary: true },
    { name: 'Dumbbell Bench Press', category: 'Strength', equipment: 'Dumbbell', musclesTargeted: ['Chest', 'Triceps', 'Shoulders'], notes: 'Press the dumbbells up and slightly together at the top. Keep your core engaged throughout.', isLibrary: true },
    { name: 'Push-ups', category: 'Strength', equipment: 'Bodyweight', musclesTargeted: ['Chest', 'Triceps', 'Shoulders'], notes: 'Keep your body in a straight line from head to heels. Lower until your chest nearly touches the floor.', isLibrary: true },
    { name: 'Incline Dumbbell Press', category: 'Strength', equipment: 'Dumbbell', musclesTargeted: ['Upper Chest', 'Triceps', 'Shoulders'], notes: 'Set the bench to 30-45 degrees. Focus on pressing up and slightly forward.', isLibrary: true },
    { name: 'Overhead Press', category: 'Strength', equipment: 'Barbell', musclesTargeted: ['Shoulders', 'Triceps'], notes: 'Keep your core tight and press the bar straight up. Avoid arching your back excessively.', isLibrary: true },
    { name: 'Dumbbell Shoulder Press', category: 'Strength', equipment: 'Dumbbell', musclesTargeted: ['Shoulders', 'Triceps'], notes: 'Press the dumbbells up in a controlled motion. Keep your elbows slightly forward.', isLibrary: true },
    { name: 'Lateral Raises', category: 'Strength', equipment: 'Dumbbell', musclesTargeted: ['Shoulders'], notes: 'Raise your arms to shoulder height with a slight bend in your elbows. Control the descent.', isLibrary: true },
    { name: 'Tricep Dips', category: 'Strength', equipment: 'Bodyweight', musclesTargeted: ['Triceps', 'Shoulders'], notes: 'Keep your elbows close to your body. Lower until your elbows are at 90 degrees.', isLibrary: true },
    { name: 'Tricep Pushdowns', category: 'Strength', equipment: 'Cable', musclesTargeted: ['Triceps'], notes: 'Keep your elbows pinned to your sides. Push down until your arms are fully extended.', isLibrary: true },
    { name: 'Chest Flyes', category: 'Strength', equipment: 'Dumbbell', musclesTargeted: ['Chest'], notes: 'Keep a slight bend in your elbows. Focus on the stretch at the bottom and squeeze at the top.', isLibrary: true },
    { name: 'Close-Grip Bench Press', category: 'Strength', equipment: 'Barbell', musclesTargeted: ['Triceps', 'Chest'], notes: 'Use a grip slightly narrower than shoulder width. Keep your elbows close to your body.', isLibrary: true },
    { name: 'Pike Push-ups', category: 'Strength', equipment: 'Bodyweight', musclesTargeted: ['Shoulders', 'Triceps'], notes: 'Form a pike position with your hips high. Lower your head toward the floor.', isLibrary: true },
    { name: 'Diamond Push-ups', category: 'Strength', equipment: 'Bodyweight', musclesTargeted: ['Triceps', 'Chest'], notes: 'Form a diamond shape with your hands. Keep your body straight throughout.', isLibrary: true },
    
    // Upper Body - Pull
    { name: 'Pull-ups', category: 'Strength', equipment: 'Bodyweight', musclesTargeted: ['Back', 'Biceps'], notes: 'Pull your body up until your chin clears the bar. Lower with control.', isLibrary: true },
    { name: 'Chin-ups', category: 'Strength', equipment: 'Bodyweight', musclesTargeted: ['Back', 'Biceps'], notes: 'Use an underhand grip. Pull until your chin is above the bar.', isLibrary: true },
    { name: 'Bent Over Rows', category: 'Strength', equipment: 'Barbell', musclesTargeted: ['Back', 'Biceps'], notes: 'Keep your back straight and core engaged. Pull the bar to your lower chest/upper abdomen.', isLibrary: true },
    { name: 'Seated Cable Rows', category: 'Strength', equipment: 'Cable', musclesTargeted: ['Back', 'Biceps'], notes: 'Pull the handle to your torso while squeezing your shoulder blades together.', isLibrary: true },
    { name: 'Lat Pulldowns', category: 'Strength', equipment: 'Cable', musclesTargeted: ['Back', 'Biceps'], notes: 'Pull the bar to your upper chest. Keep your torso upright and avoid swinging.', isLibrary: true },
    { name: 'T-Bar Rows', category: 'Strength', equipment: 'Machine', musclesTargeted: ['Back', 'Biceps'], notes: 'Keep your chest up and pull the weight to your torso. Squeeze at the top.', isLibrary: true },
    { name: 'Bicep Curls', category: 'Strength', equipment: 'Dumbbell', musclesTargeted: ['Biceps'], notes: 'Keep your elbows stationary. Curl the weight up and control the descent.', isLibrary: true },
    { name: 'Hammer Curls', category: 'Strength', equipment: 'Dumbbell', musclesTargeted: ['Biceps', 'Forearms'], notes: 'Use a neutral grip. Curl with your palms facing each other.', isLibrary: true },
    { name: 'Cable Curls', category: 'Strength', equipment: 'Cable', musclesTargeted: ['Biceps'], notes: 'Keep constant tension on the cable. Squeeze at the top of the movement.', isLibrary: true },
    { name: 'Face Pulls', category: 'Strength', equipment: 'Cable', musclesTargeted: ['Rear Delts', 'Rhomboids'], notes: 'Pull the cable to your face level. Focus on squeezing your rear delts.', isLibrary: true },
    { name: 'Inverted Rows', category: 'Strength', equipment: 'Bodyweight', musclesTargeted: ['Back', 'Biceps'], notes: 'Keep your body straight. Pull your chest to the bar.', isLibrary: true },
    { name: 'Cable Flyes', category: 'Strength', equipment: 'Cable', musclesTargeted: ['Chest'], notes: 'Keep a slight bend in your elbows. Focus on the stretch and squeeze.', isLibrary: true },
    
    // Lower Body
    { name: 'Barbell Squats', category: 'Strength', equipment: 'Barbell', musclesTargeted: ['Quads', 'Glutes', 'Hamstrings'], notes: 'Keep your chest up and core tight. Lower until your thighs are parallel to the floor.', isLibrary: true },
    { name: 'Front Squats', category: 'Strength', equipment: 'Barbell', musclesTargeted: ['Quads', 'Glutes', 'Core'], notes: 'Keep the bar on your front delts. Maintain an upright torso throughout.', isLibrary: true },
    { name: 'Romanian Deadlifts', category: 'Strength', equipment: 'Barbell', musclesTargeted: ['Hamstrings', 'Glutes', 'Lower Back'], notes: 'Keep your legs mostly straight. Hinge at the hips and feel the stretch in your hamstrings.', isLibrary: true },
    { name: 'Conventional Deadlifts', category: 'Strength', equipment: 'Barbell', musclesTargeted: ['Hamstrings', 'Glutes', 'Lower Back', 'Traps'], notes: 'Keep your back straight. Drive through your heels and stand up tall.', isLibrary: true },
    { name: 'Leg Press', category: 'Strength', equipment: 'Machine', musclesTargeted: ['Quads', 'Glutes'], notes: 'Lower the weight until your knees are at 90 degrees. Press through your heels.', isLibrary: true },
    { name: 'Lunges', category: 'Strength', equipment: 'Bodyweight', musclesTargeted: ['Quads', 'Glutes'], notes: 'Step forward and lower your back knee toward the ground. Keep your front knee over your ankle.', isLibrary: true },
    { name: 'Walking Lunges', category: 'Strength', equipment: 'Bodyweight', musclesTargeted: ['Quads', 'Glutes'], notes: 'Step forward into a lunge, then push off and step forward with the other leg.', isLibrary: true },
    { name: 'Bulgarian Split Squats', category: 'Strength', equipment: 'Bodyweight', musclesTargeted: ['Quads', 'Glutes'], notes: 'Place your back foot on a bench. Lower until your front thigh is parallel to the floor.', isLibrary: true },
    { name: 'Leg Curls', category: 'Strength', equipment: 'Machine', musclesTargeted: ['Hamstrings'], notes: 'Curl your heels toward your glutes. Squeeze at the top.', isLibrary: true },
    { name: 'Leg Extensions', category: 'Strength', equipment: 'Machine', musclesTargeted: ['Quads'], notes: 'Extend your legs fully. Control the weight on the way down.', isLibrary: true },
    { name: 'Calf Raises', category: 'Strength', equipment: 'Bodyweight', musclesTargeted: ['Calves'], notes: 'Rise up onto your toes. Hold at the top and lower with control.', isLibrary: true },
    { name: 'Hip Thrusts', category: 'Strength', equipment: 'Barbell', musclesTargeted: ['Glutes', 'Hamstrings'], notes: 'Drive your hips up and squeeze your glutes at the top. Keep your chin tucked.', isLibrary: true },
    { name: 'Goblet Squats', category: 'Strength', equipment: 'Dumbbell', musclesTargeted: ['Quads', 'Glutes', 'Core'], notes: 'Hold a dumbbell at your chest. Squat down while keeping your torso upright.', isLibrary: true },
    { name: 'Sumo Deadlifts', category: 'Strength', equipment: 'Barbell', musclesTargeted: ['Glutes', 'Hamstrings', 'Inner Thighs'], notes: 'Use a wide stance with toes pointed out. Keep your back straight.', isLibrary: true },
    { name: 'Step-ups', category: 'Strength', equipment: 'Bodyweight', musclesTargeted: ['Quads', 'Glutes'], notes: 'Step up onto a box or bench. Drive through your heel and stand tall.', isLibrary: true },
    
    // Core
    { name: 'Plank', category: 'Core', equipment: 'Bodyweight', musclesTargeted: ['Core', 'Shoulders'], notes: 'Keep your body in a straight line. Hold without sagging or raising your hips.', isLibrary: true },
    { name: 'Side Plank', category: 'Core', equipment: 'Bodyweight', musclesTargeted: ['Obliques', 'Core'], notes: 'Stack your feet and keep your body straight. Hold without rotating.', isLibrary: true },
    { name: 'Russian Twists', category: 'Core', equipment: 'Bodyweight', musclesTargeted: ['Obliques', 'Core'], notes: 'Rotate your torso side to side. Keep your feet off the ground if possible.', isLibrary: true },
    { name: 'Leg Raises', category: 'Core', equipment: 'Bodyweight', musclesTargeted: ['Lower Abs', 'Hip Flexors'], notes: 'Lift your legs straight up. Lower with control without letting them touch the ground.', isLibrary: true },
    { name: 'Crunches', category: 'Core', equipment: 'Bodyweight', musclesTargeted: ['Abs'], notes: 'Curl your upper body toward your knees. Keep your lower back on the ground.', isLibrary: true },
    { name: 'Bicycle Crunches', category: 'Core', equipment: 'Bodyweight', musclesTargeted: ['Abs', 'Obliques'], notes: 'Alternate bringing your elbow to the opposite knee. Keep your feet off the ground.', isLibrary: true },
    { name: 'Mountain Climbers', category: 'Core', equipment: 'Bodyweight', musclesTargeted: ['Core', 'Shoulders'], notes: 'Alternate bringing your knees to your chest quickly. Keep your hips level.', isLibrary: true },
    { name: 'Dead Bug', category: 'Core', equipment: 'Bodyweight', musclesTargeted: ['Core'], notes: 'Extend opposite arm and leg while keeping your lower back pressed to the floor.', isLibrary: true },
    { name: 'Hanging Leg Raises', category: 'Core', equipment: 'Bodyweight', musclesTargeted: ['Lower Abs', 'Hip Flexors'], notes: 'Hang from a bar and raise your legs. Avoid swinging.', isLibrary: true },
    { name: 'Ab Wheel Rollout', category: 'Core', equipment: 'Bodyweight', musclesTargeted: ['Core', 'Shoulders'], notes: 'Roll the wheel forward while keeping your core tight. Don\'t let your lower back sag.', isLibrary: true },
    { name: 'V-Ups', category: 'Core', equipment: 'Bodyweight', musclesTargeted: ['Abs', 'Hip Flexors'], notes: 'Lift your legs and torso simultaneously to form a V shape.', isLibrary: true },
    { name: 'Flutter Kicks', category: 'Core', equipment: 'Bodyweight', musclesTargeted: ['Lower Abs', 'Hip Flexors'], notes: 'Alternate kicking your legs up and down. Keep your lower back pressed to the floor.', isLibrary: true },
    
    // Cardio
    { name: 'Burpees', category: 'Cardio', equipment: 'Bodyweight', musclesTargeted: ['Full Body'], notes: 'Drop into a squat, jump back to plank, do a push-up, jump forward, and jump up.', isLibrary: true },
    { name: 'Jumping Jacks', category: 'Cardio', equipment: 'Bodyweight', musclesTargeted: ['Full Body'], notes: 'Jump while spreading your legs and raising your arms overhead.', isLibrary: true },
    { name: 'High Knees', category: 'Cardio', equipment: 'Bodyweight', musclesTargeted: ['Legs', 'Core'], notes: 'Run in place while bringing your knees up toward your chest.', isLibrary: true },
    { name: 'Jump Squats', category: 'Cardio', equipment: 'Bodyweight', musclesTargeted: ['Quads', 'Glutes'], notes: 'Squat down and explode up into a jump. Land softly.', isLibrary: true },
    { name: 'Box Jumps', category: 'Cardio', equipment: 'Bodyweight', musclesTargeted: ['Quads', 'Glutes'], notes: 'Jump onto a box or platform. Step down carefully.', isLibrary: true },
    { name: 'Sprint Intervals', category: 'Cardio', equipment: 'Bodyweight', musclesTargeted: ['Legs', 'Cardiovascular'], notes: 'Run at maximum effort for short bursts followed by rest periods.', isLibrary: true },
    { name: 'Jump Rope', category: 'Cardio', equipment: 'Rope', musclesTargeted: ['Legs', 'Cardiovascular', 'Calves'], notes: 'Jump over the rope with both feet or alternate feet. Keep a steady rhythm.', isLibrary: true },
    { name: 'Bear Crawls', category: 'Cardio', equipment: 'Bodyweight', musclesTargeted: ['Full Body', 'Core'], notes: 'Crawl on hands and feet while keeping your knees slightly off the ground.', isLibrary: true },
    
    // Mobility & Stretch
    { name: 'Hip Flexor Stretch', category: 'Mobility', equipment: 'Bodyweight', musclesTargeted: ['Hip Flexors'], notes: 'Lunge forward and push your hips forward. Hold for 30-60 seconds.', isLibrary: true },
    { name: 'Hamstring Stretch', category: 'Mobility', equipment: 'Bodyweight', musclesTargeted: ['Hamstrings'], notes: 'Sit with one leg extended. Reach toward your toes and hold.', isLibrary: true },
    { name: 'Shoulder Mobility', category: 'Mobility', equipment: 'Bodyweight', musclesTargeted: ['Shoulders'], notes: 'Perform arm circles and cross-body stretches. Move slowly and controlled.', isLibrary: true },
    { name: 'Thoracic Spine Rotation', category: 'Mobility', equipment: 'Bodyweight', musclesTargeted: ['Upper Back'], notes: 'Rotate your upper back while keeping your hips stable.', isLibrary: true },
    { name: 'Cat-Cow Stretch', category: 'Mobility', equipment: 'Bodyweight', musclesTargeted: ['Spine'], notes: 'Alternate between arching and rounding your back. Move slowly.', isLibrary: true },
    { name: 'Pigeon Pose', category: 'Mobility', equipment: 'Bodyweight', musclesTargeted: ['Hip Flexors', 'Glutes'], notes: 'Bring one leg forward in a bent position. Hold and breathe deeply.', isLibrary: true },
    { name: 'Quad Stretch', category: 'Mobility', equipment: 'Bodyweight', musclesTargeted: ['Quads'], notes: 'Stand and pull your heel toward your glutes. Hold and switch sides.', isLibrary: true },
    
    // Functional
    { name: 'Kettlebell Swings', category: 'Strength', equipment: 'Kettlebell', musclesTargeted: ['Glutes', 'Hamstrings', 'Core'], notes: 'Hinge at the hips and swing the kettlebell to chest height. Use your hips, not your arms.', isLibrary: true },
    { name: 'Turkish Get-ups', category: 'Strength', equipment: 'Kettlebell', musclesTargeted: ['Full Body'], notes: 'Complex movement transitioning from lying to standing while holding a weight overhead.', isLibrary: true },
    { name: 'Farmer\'s Walk', category: 'Strength', equipment: 'Dumbbell', musclesTargeted: ['Forearms', 'Core', 'Traps'], notes: 'Walk while carrying heavy weights at your sides. Keep your core tight and shoulders back.', isLibrary: true },
    { name: 'Battle Ropes', category: 'Cardio', equipment: 'Rope', musclesTargeted: ['Shoulders', 'Core', 'Cardiovascular'], notes: 'Alternate slamming the ropes up and down. Keep your core engaged.', isLibrary: true },
    { name: 'Medicine Ball Slams', category: 'Cardio', equipment: 'Medicine Ball', musclesTargeted: ['Full Body', 'Core'], notes: 'Lift the ball overhead and slam it down with force. Catch and repeat.', isLibrary: true },
    { name: 'Wall Balls', category: 'Cardio', equipment: 'Medicine Ball', musclesTargeted: ['Quads', 'Glutes', 'Shoulders'], notes: 'Squat down and throw the ball to a target on the wall. Catch and repeat.', isLibrary: true },
  ];

  for (const ex of exerciseLibrary) {
    const existing = await prisma.exercise.findFirst({
      where: {
        name: ex.name,
        isLibraryExercise: true,
      },
    });

    if (existing) {
      await prisma.exercise.update({
        where: { id: existing.id },
        data: {
          category: ex.category,
          equipment: ex.equipment,
          musclesTargeted: ex.musclesTargeted,
          isLibraryExercise: ex.isLibrary,
          notes: ex.notes,
        },
      });
    } else {
      await prisma.exercise.create({
        data: {
          name: ex.name,
          category: ex.category,
          equipment: ex.equipment,
          musclesTargeted: ex.musclesTargeted,
          isLibraryExercise: ex.isLibrary,
          notes: ex.notes,
          sets: 3,
          reps: 10,
          restSeconds: 60,
          defaultVideoSourceType: 'YOUTUBE',
        },
      });
    }
  }
  console.log(`✅ Exercise library created (${exerciseLibrary.length} exercises)`);

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
  // Delete existing subscriptions and payments for this user
  await prisma.payment.deleteMany({
    where: { userId: premiumClient.user.id },
  });
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
            stripePaymentIntentId: `pi_test_${Date.now()}_${premiumClient.user.id}`, // Unique ID
            stripeInvoiceId: `in_test_${Date.now()}_${premiumClient.user.id}`, // Unique ID
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
  for (let i = 0; i < 5; i++) {
    const measureDate = new Date();
    measureDate.setDate(measureDate.getDate() - (i * 7));
    
    await prisma.bodyMeasurement.create({
      data: {
        userId: createdClients[0].user.id,
        date: measureDate,
        weight: 70 - (i * 0.5),
        bodyFat: 20 - (i * 0.3),
        muscleMass: 50 + (i * 0.2),
        neck: 38 + (i * 0.1),
        shoulders: 110 + (i * 0.5),
        chest: 100 + (i * 1),
        waist: 85 - (i * 0.5),
        hips: 95,
        bicepL: 30 + (i * 0.2),
        bicepR: 30.2 + (i * 0.2),
        forearmL: 28 + (i * 0.1),
        forearmR: 28.1 + (i * 0.1),
        thighL: 55 + (i * 0.3),
        thighR: 55.2 + (i * 0.3),
        calfL: 36 + (i * 0.2),
        calfR: 36.1 + (i * 0.2),
      },
    });
  }
  
  // Add measurements for other clients
  for (let i = 0; i < 3; i++) {
    const measureDate = new Date();
    measureDate.setDate(measureDate.getDate() - (i * 10));
    
    await prisma.bodyMeasurement.create({
      data: {
        userId: createdClients[1].user.id,
        date: measureDate,
        weight: 65 - (i * 0.3),
        bodyFat: 22 - (i * 0.2),
        muscleMass: 48 + (i * 0.15),
        neck: 36 + (i * 0.1),
        shoulders: 105 + (i * 0.4),
        chest: 95 + (i * 0.8),
        waist: 80 - (i * 0.4),
        hips: 90,
        bicepL: 28 + (i * 0.15),
        bicepR: 28.1 + (i * 0.15),
        forearmL: 26 + (i * 0.1),
        forearmR: 26.1 + (i * 0.1),
        thighL: 52 + (i * 0.25),
        thighR: 52.2 + (i * 0.25),
        calfL: 34 + (i * 0.15),
        calfR: 34.1 + (i * 0.15),
      },
    });
  }
  console.log('✅ Body measurements created');

  // ============================================
  // CREATE MEAL PLANS
  // ============================================
  // Create meal plan for client (assigned by coach)
  const mealPlan = await prisma.mealPlan.create({
    data: {
      userId: coach1.id, // Created by coach
      name: 'Balanced Nutrition Plan',
      goal: 'maintenance',
      calories: 2000,
      protein: 150,
      carbs: 200,
      fats: 65,
      fiber: 30,
      days: 7,
      createdBy: coach1.id,
      assignedTo: mainClient.id, // Assigned to first client
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      meals: {
        create: [
          {
            name: 'Oatmeal with Berries',
            mealType: 'breakfast',
            day: 1,
            calories: 400,
            protein: 15,
            carbs: 60,
            fats: 10,
            ingredients: ['oats', 'blueberries', 'almond milk', 'honey'],
            notes: 'Use steel-cut oats for better texture',
          },
          {
            name: 'Grilled Chicken Salad',
            mealType: 'lunch',
            day: 1,
            calories: 500,
            protein: 40,
            carbs: 30,
            fats: 20,
            ingredients: ['chicken breast', 'mixed greens', 'olive oil', 'vegetables'],
            notes: 'Grill chicken with herbs and lemon',
          },
          {
            name: 'Salmon with Quinoa',
            mealType: 'dinner',
            day: 1,
            calories: 600,
            protein: 45,
            carbs: 50,
            fats: 25,
            ingredients: ['salmon', 'quinoa', 'broccoli', 'lemon'],
            notes: 'Bake salmon at 400°F for 12-15 minutes',
          },
          // Day 2 meals
          {
            name: 'Greek Yogurt Parfait',
            mealType: 'breakfast',
            day: 2,
            calories: 350,
            protein: 20,
            carbs: 45,
            fats: 8,
            ingredients: ['greek yogurt', 'granola', 'berries', 'honey'],
          },
          {
            name: 'Turkey Wrap',
            mealType: 'lunch',
            day: 2,
            calories: 450,
            protein: 35,
            carbs: 40,
            fats: 15,
            ingredients: ['turkey breast', 'whole wheat tortilla', 'lettuce', 'tomato', 'hummus'],
          },
          {
            name: 'Beef Stir Fry',
            mealType: 'dinner',
            day: 2,
            calories: 550,
            protein: 42,
            carbs: 45,
            fats: 22,
            ingredients: ['lean beef', 'brown rice', 'mixed vegetables', 'soy sauce'],
          },
        ],
      },
    },
  });
  
  // Create another meal plan (cutting plan)
  const cuttingPlan = await prisma.mealPlan.create({
    data: {
      userId: coach1.id,
      name: 'Cutting Meal Plan',
      goal: 'cutting',
      calories: 1600,
      protein: 140,
      carbs: 120,
      fats: 55,
      fiber: 25,
      days: 5,
      createdBy: coach1.id,
      assignedTo: createdClients[1]?.client?.id || null,
      startDate: new Date(),
      meals: {
        create: [
          {
            name: 'Protein Smoothie',
            mealType: 'breakfast',
            day: 1,
            calories: 300,
            protein: 30,
            carbs: 25,
            fats: 8,
            ingredients: ['protein powder', 'spinach', 'banana', 'almond milk'],
          },
          {
            name: 'Chicken and Vegetables',
            mealType: 'lunch',
            day: 1,
            calories: 400,
            protein: 45,
            carbs: 20,
            fats: 15,
            ingredients: ['chicken breast', 'broccoli', 'carrots', 'olive oil'],
          },
          {
            name: 'Baked Cod with Asparagus',
            mealType: 'dinner',
            day: 1,
            calories: 350,
            protein: 40,
            carbs: 15,
            fats: 12,
            ingredients: ['cod fillet', 'asparagus', 'lemon', 'herbs'],
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

  // Add more challenge participants for testing
  const challenge = await prisma.challenge.findFirst({
    where: { name: '30-Day Challenge' },
  });

  if (challenge) {
    // Add participants for all clients
    for (let i = 0; i < createdClients.length; i++) {
      const existing = await prisma.challengeParticipant.findUnique({
        where: {
          challengeId_userId: {
            challengeId: challenge.id,
            userId: createdClients[i].user.id,
          },
        },
      });

      if (!existing) {
        await prisma.challengeParticipant.create({
          data: {
            challengeId: challenge.id,
            userId: createdClients[i].user.id,
            progress: Math.floor(Math.random() * 30) + 5, // Random progress 5-35
            rank: i + 1,
          },
        });
      }
    }
  }
  console.log('✅ Challenge participants updated');

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
  // CREATE PROGRESS PHOTOS
  // ============================================
  const photoPoses = ['front', 'side', 'back'];
  for (let i = 0; i < 6; i++) {
    const photoDate = new Date();
    photoDate.setDate(photoDate.getDate() - (i * 14)); // Every 2 weeks
    
    await prisma.progressPhoto.create({
      data: {
        userId: createdClients[0].user.id,
        photoUrl: `https://picsum.photos/400/600?random=${i + 100}`, // Placeholder image
        photoType: photoPoses[i % photoPoses.length],
        date: photoDate,
        notes: i === 0 ? 'Starting point' : `Progress update - Week ${i * 2}`,
        sharedWithCoach: i % 2 === 0, // Share every other photo
      },
    });
  }
  
  // Add photos for second client
  if (createdClients[1]) {
    for (let i = 0; i < 4; i++) {
      const photoDate = new Date();
      photoDate.setDate(photoDate.getDate() - (i * 21)); // Every 3 weeks
      
      await prisma.progressPhoto.create({
        data: {
          userId: createdClients[1].user.id,
          photoUrl: `https://picsum.photos/400/600?random=${i + 200}`,
          photoType: photoPoses[i % photoPoses.length],
          date: photoDate,
          notes: `Progress check - Month ${i + 1}`,
          sharedWithCoach: true,
        },
      });
    }
  }
  console.log('✅ Progress photos created');

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

  // ============================================
  // CREATE ADDITIONAL WORKOUT SESSIONS FOR TESTING
  // ============================================
  if (mainClientUser && structuredWorkout) {
    // Create sessions for past days to test program map
    const program = await prisma.program.findFirst({
      where: { name: '4-Week Strength Builder' },
      include: {
        days: {
          orderBy: { dayIndex: 'asc' },
          include: { workout: true },
        },
      },
    });

    // Get client record with program start date
    const clientRecord = await prisma.client.findUnique({
      where: { id: mainClient.id },
    });

    if (program && clientRecord?.programStartDate) {
      const startOfDayHelper = (d: Date) => {
        const date = new Date(d);
        date.setHours(0, 0, 0, 0);
        return date;
      };
      const start = startOfDayHelper(clientRecord.programStartDate);
      
      // Create completed sessions for days 1, 3, 5 (workout days)
      const workoutDays = [1, 3, 5];
      for (const dayIndex of workoutDays) {
        const programDay = program.days.find((d) => d.dayIndex === dayIndex && !d.isRestDay);
        if (programDay && programDay.workout) {
          const sessionDate = new Date(start);
          sessionDate.setDate(start.getDate() + dayIndex - 1);
          const sessionStart = startOfDayHelper(sessionDate);
          
          const existingSession = await prisma.workoutSession.findFirst({
            where: {
              clientId: mainClientUser.id,
              programDayId: programDay.id,
              dateTimeStarted: {
                gte: sessionStart,
                lt: new Date(sessionStart.getTime() + 24 * 60 * 60 * 1000),
              },
            },
          });

          if (!existingSession) {
            const session = await prisma.workoutSession.create({
              data: {
                clientId: mainClientUser.id,
                workoutId: programDay.workout.id,
                programDayId: programDay.id,
                dateTimeStarted: new Date(sessionDate.getTime() + 8 * 60 * 60 * 1000), // 8 AM
                dateTimeCompleted: new Date(sessionDate.getTime() + 8 * 60 * 60 * 1000 + 45 * 60 * 1000), // 45 min later
                status: 'COMPLETED',
                clientNotes: `Completed workout for day ${dayIndex}`,
              },
            });

            // Create sample set logs
            const workoutExercises = await prisma.workoutExercise.findMany({
              where: {
                block: {
                  section: {
                    workoutId: programDay.workout.id,
                  },
                },
              },
              take: 2, // Just 2 exercises for seed
            });

            for (const exercise of workoutExercises) {
              const targetRepsArray = Array.isArray(exercise.targetRepsBySet)
                ? (exercise.targetRepsBySet as number[])
                : [8, 8, 6];
              
              for (let i = 0; i < Math.min(3, targetRepsArray.length); i++) {
                const targetRep = typeof targetRepsArray[i] === 'number' ? targetRepsArray[i] : 8;
                await prisma.exerciseSetLog.create({
                  data: {
                    sessionId: session.id,
                    workoutExerciseId: exercise.id,
                    exerciseName: exercise.name,
                    setNumber: i + 1,
                    targetReps: targetRep,
                    targetWeight: 60 + (i * 5),
                    targetUnit: 'kg',
                    actualReps: targetRep,
                    actualWeight: 60 + (i * 5),
                    actualUnit: 'kg',
                    feelingCode: i === targetRepsArray.length - 1 ? 'HARD' : 'GOOD_CHALLENGE',
                    feelingEmoji: i === targetRepsArray.length - 1 ? '😓' : '🙂',
                  },
                });
              }
            }
          }
        }
      }
    }
  }
  console.log('✅ Additional workout sessions created for testing');

  // ============================================
  // CREATE COMPREHENSIVE TEST DATA FOR WORKOUT EXECUTION SCREEN
  // ============================================
  if (mainClientUser && structuredWorkout) {
    // Get the client's current program
    const clientRecord = await prisma.client.findUnique({
      where: { id: mainClient.id },
      include: {
        currentProgram: {
          include: {
            days: {
              orderBy: { dayIndex: 'asc' },
              include: { workout: true },
            },
          },
        },
      },
    });

    if (clientRecord?.currentProgram) {
      const program = clientRecord.currentProgram;
      
      // Find today's workout day
      const today = new Date();
      const programStart = clientRecord.programStartDate 
        ? new Date(clientRecord.programStartDate)
        : new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000); // Default to 7 days ago
      
      programStart.setHours(0, 0, 0, 0);
      const daysSinceStart = Math.floor((today.getTime() - programStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const todayProgramDay = program.days.find((d) => d.dayIndex === daysSinceStart && !d.isRestDay);

      if (todayProgramDay && todayProgramDay.workout) {
        // Create a completed session from 3 days ago with FULL set logs for ALL exercises
        const threeDaysAgo = new Date(today);
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        threeDaysAgo.setHours(8, 0, 0, 0);

        const previousDayIndex = Math.max(1, daysSinceStart - 3);
        const previousProgramDay = program.days.find((d) => d.dayIndex === previousDayIndex && !d.isRestDay);

        if (previousProgramDay && previousProgramDay.workout) {
          // Check if session already exists
          const existingPreviousSession = await prisma.workoutSession.findFirst({
            where: {
              clientId: mainClientUser.id,
              workoutId: previousProgramDay.workout.id,
              dateTimeStarted: {
                gte: new Date(threeDaysAgo.getTime() - 12 * 60 * 60 * 1000),
                lt: new Date(threeDaysAgo.getTime() + 12 * 60 * 60 * 1000),
              },
            },
          });

          if (!existingPreviousSession) {
            const previousSession = await prisma.workoutSession.create({
              data: {
                clientId: mainClientUser.id,
                workoutId: previousProgramDay.workout.id,
                programDayId: previousProgramDay.id,
                dateTimeStarted: threeDaysAgo,
                dateTimeCompleted: new Date(threeDaysAgo.getTime() + 50 * 60 * 1000), // 50 min
                status: 'COMPLETED',
                clientNotes: 'Previous session for testing Previous column',
              },
            });

            // Get ALL exercises from the workout
            const allExercises = await prisma.workoutExercise.findMany({
              where: {
                block: {
                  section: {
                    workoutId: previousProgramDay.workout.id,
                  },
                },
              },
              orderBy: [
                { block: { section: { order: 'asc' } } },
                { block: { order: 'asc' } },
                { order: 'asc' },
              ],
            });

            // Create set logs for ALL exercises
            for (const exercise of allExercises) {
              const targetRepsArray = Array.isArray(exercise.targetRepsBySet)
                ? (exercise.targetRepsBySet as number[])
                : typeof exercise.targetRepsBySet === 'number'
                ? [exercise.targetRepsBySet]
                : [8, 8, 6];

              const targetWeightsArray = Array.isArray(exercise.targetWeightBySet)
                ? (exercise.targetWeightBySet as number[])
                : exercise.targetWeightBySet && typeof exercise.targetWeightBySet === 'number'
                ? [exercise.targetWeightBySet]
                : [60, 65, 70];

              for (let i = 0; i < targetRepsArray.length; i++) {
                const targetRep = typeof targetRepsArray[i] === 'number' ? targetRepsArray[i] : 8;
                const targetWeight = targetWeightsArray[i] as number || (60 + i * 5);
                
                await prisma.exerciseSetLog.create({
                  data: {
                    sessionId: previousSession.id,
                    workoutExerciseId: exercise.id,
                    exerciseName: exercise.name,
                    setNumber: i + 1,
                    targetReps: targetRep,
                    targetWeight,
                    targetUnit: 'kg',
                    actualReps: targetRep,
                    actualWeight: targetWeight,
                    actualUnit: 'kg',
                    feelingCode: i === targetRepsArray.length - 1 ? 'HARD' : 'GOOD_CHALLENGE',
                    feelingEmoji: i === targetRepsArray.length - 1 ? '😓' : '🙂',
                  },
                });
              }
            }
            console.log(`✅ Created previous session with ${allExercises.length} exercises for testing Previous column`);
          }
        }

        // Create an IN_PROGRESS session for today (if it doesn't exist)
        const existingInProgress = await prisma.workoutSession.findFirst({
          where: {
            clientId: mainClientUser.id,
            workoutId: todayProgramDay.workout.id,
            programDayId: todayProgramDay.id,
            status: 'IN_PROGRESS',
            dateTimeStarted: {
              gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
            },
          },
        });

        if (!existingInProgress) {
          const inProgressSession = await prisma.workoutSession.create({
            data: {
              clientId: mainClientUser.id,
              workoutId: todayProgramDay.workout.id,
              programDayId: todayProgramDay.id,
              dateTimeStarted: new Date(today.getTime() - 10 * 60 * 1000), // Started 10 minutes ago
              status: 'IN_PROGRESS',
            },
          });

          // Pre-seed some set logs (partially completed)
          const todayExercises = await prisma.workoutExercise.findMany({
            where: {
              block: {
                section: {
                  workoutId: todayProgramDay.workout.id,
                },
              },
            },
            orderBy: [
              { block: { section: { order: 'asc' } } },
              { block: { order: 'asc' } },
              { order: 'asc' },
            ],
            take: 2, // Pre-seed first 2 exercises
          });

          for (const exercise of todayExercises) {
            const targetRepsArray = Array.isArray(exercise.targetRepsBySet)
              ? (exercise.targetRepsBySet as number[])
              : typeof exercise.targetRepsBySet === 'number'
              ? [exercise.targetRepsBySet]
              : [8, 8, 6];

            const targetWeightsArray = Array.isArray(exercise.targetWeightBySet)
              ? (exercise.targetWeightBySet as number[])
              : exercise.targetWeightBySet && typeof exercise.targetWeightBySet === 'number'
              ? [exercise.targetWeightBySet]
              : [60, 65, 70];

            // Create logs for first 2 sets only (partially completed)
            for (let i = 0; i < Math.min(2, targetRepsArray.length); i++) {
              const targetRep = typeof targetRepsArray[i] === 'number' ? targetRepsArray[i] : 8;
              const targetWeight = targetWeightsArray[i] as number || (60 + i * 5);

              await prisma.exerciseSetLog.create({
                data: {
                  sessionId: inProgressSession.id,
                  workoutExerciseId: exercise.id,
                  exerciseName: exercise.name,
                  setNumber: i + 1,
                  targetReps: targetRep,
                  targetWeight,
                  targetUnit: 'kg',
                  actualReps: targetRep,
                  actualWeight: targetWeight,
                  actualUnit: 'kg',
                  feelingCode: 'GOOD_CHALLENGE',
                  feelingEmoji: '🙂',
                },
              });
            }
          }
          console.log('✅ Created IN_PROGRESS session for today (can be resumed)');
        }
      }
    }
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
