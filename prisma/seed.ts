import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Helper function to parse Library.MD exercise format
function parseExerciseLine(line: string) {
  const parts = line.split('–');
  if (parts.length < 2) return null;
  
  const name = parts[0].trim();
  const rest = parts.slice(1).join('–').trim();
  
  const segments = rest.split('|').map(s => s.trim());
  if (segments.length < 5) return null;
  
  const modality = segments[0];
  const movementPattern = segments[1];
  const primaryMusclesStr = segments[2];
  const equipmentCategory = segments[3];
  const difficulty = segments[4];
  const defaultPrescription = segments[5] || '';
  
  // Parse primary muscles (can be "quads/glutes" or "quads, glutes")
  const primaryMuscles = primaryMusclesStr.split(/[\/,]/).map(m => m.trim());
  
  // Determine secondary muscles (if any)
  const secondaryMuscles: string[] = [];
  
  // Determine body region from movement pattern and muscles
  let bodyRegion = 'full';
  if (movementPattern.includes('squat') || movementPattern.includes('lunge') || movementPattern.includes('hinge') || primaryMuscles.some(m => ['quads', 'glutes', 'hamstrings', 'calves'].includes(m.toLowerCase()))) {
    bodyRegion = 'lower';
  } else if (movementPattern.includes('push') || movementPattern.includes('pull') || primaryMuscles.some(m => ['chest', 'shoulders', 'triceps', 'biceps', 'back', 'lats'].includes(m.toLowerCase()))) {
    bodyRegion = 'upper';
  } else if (movementPattern.includes('core') || primaryMuscles.some(m => ['abs', 'core', 'obliques'].includes(m.toLowerCase()))) {
    bodyRegion = 'core';
  }
  
  // Parse equipment detail (e.g., "machine: Leg Press")
  let equipmentDetail: string | undefined;
  let equipmentCategoryClean = equipmentCategory;
  if (equipmentCategory.includes(':')) {
    const parts = equipmentCategory.split(':');
    equipmentCategoryClean = parts[0].trim();
    equipmentDetail = parts[1].trim();
  }
  
  // Determine impact level
  let impactLevel = 'low';
  if (modality === 'plyometric' || modality === 'conditioning' || name.toLowerCase().includes('jump')) {
    impactLevel = 'high';
  } else if (modality === 'cardio' || name.toLowerCase().includes('run') || name.toLowerCase().includes('sprint')) {
    impactLevel = 'medium';
  }
  
  // Determine environment
  let environment = 'any';
  if (equipmentCategoryClean.includes('machine') || equipmentCategoryClean.includes('cable')) {
    environment = 'gym';
  } else if (equipmentCategoryClean === 'bodyweight') {
    environment = 'home';
  }
  
  // Determine goal tags
  const goalTags: string[] = [];
  if (modality === 'strength') goalTags.push('strength');
  if (modality === 'hypertrophy') goalTags.push('hypertrophy');
  if (modality === 'cardio' || modality === 'conditioning') goalTags.push('fat_loss', 'endurance');
  if (modality === 'mobility' || modality === 'stretch') goalTags.push('mobility');
  if (modality === 'rehab') goalTags.push('rehab');
  if (modality === 'power' || name.toLowerCase().includes('power')) goalTags.push('power');
  if (modality === 'core') goalTags.push('performance');
  
  // Determine logging options
  const loggingOptions: string[] = [];
  if (defaultPrescription.includes('×') || defaultPrescription.includes('reps')) {
    loggingOptions.push('reps');
  }
  if (defaultPrescription.includes('min') || defaultPrescription.includes('s') || defaultPrescription.includes('time')) {
    loggingOptions.push('time');
  }
  if (equipmentCategoryClean !== 'bodyweight' && !equipmentCategoryClean.includes('cardio')) {
    loggingOptions.push('weight');
  }
  if (defaultPrescription.includes('RPE')) {
    loggingOptions.push('RPE');
  }
  if (defaultPrescription.includes('m') && !defaultPrescription.includes('min')) {
    loggingOptions.push('distance');
  }
  
  // Parse default prescription
  let sets = 3;
  let reps: number | null = null;
  let durationSeconds: number | null = null;
  let restSeconds = 60;
  
  if (defaultPrescription) {
    // Parse sets x reps format: "3×12–15" or "4×5–8"
    const setRepMatch = defaultPrescription.match(/(\d+)×(\d+)(?:–(\d+))?/);
    if (setRepMatch) {
      sets = parseInt(setRepMatch[1]);
      reps = parseInt(setRepMatch[2]);
    }
    
    // Parse time format: "20–30 min" or "3×20–40s"
    const timeMatch = defaultPrescription.match(/(\d+)–?(\d+)?\s*(min|s|sec)/);
    if (timeMatch) {
      const unit = timeMatch[3];
      const value = parseInt(timeMatch[1]);
      if (unit === 'min') {
        durationSeconds = value * 60;
      } else {
        durationSeconds = value;
      }
    }
    
    // Parse rest: "rest 60s" or "rest 90–120s"
    const restMatch = defaultPrescription.match(/rest\s+(\d+)(?:–(\d+))?s?/);
    if (restMatch) {
      restSeconds = parseInt(restMatch[1]);
    }
  }
  
  return {
    name,
    modality,
    movementPattern,
    primaryMuscles,
    secondaryMuscles,
    bodyRegion,
    equipmentCategory: equipmentCategoryClean,
    equipmentDetail,
    difficulty,
    impactLevel,
    environment,
    goalTags,
    loggingOptions,
    sets,
    reps,
    durationSeconds,
    restSeconds,
    defaultPrescription,
  };
}

// Comprehensive exercise library from Library.MD
const libraryExercises = [
  // 3.1 Lower Body – Strength
  'Bodyweight Squat – strength | squat | quads/glutes | bodyweight | beginner | 3×12–15, rest 60s',
  'Goblet Squat – strength | squat | quads/glutes | dumbbell | beginner | 3×8–12, rest 60–90s',
  'Back Squat – strength | squat | quads/glutes | barbell | intermediate | 4×5–8, rest 120s',
  'Front Squat – strength | squat | quads | barbell | intermediate | 4×4–6, rest 120s',
  'Box Squat – strength | squat | glutes/hamstrings | barbell | intermediate | 4×3–6, rest 150s',
  'Bulgarian Split Squat (DB) – strength | lunge | quads/glutes | dumbbell | intermediate | 3×8–10/leg, rest 90s',
  'Reverse Lunge (DB) – strength | lunge | glutes/quads | dumbbell | beginner | 3×8–12/leg, rest 60–90s',
  'Walking Lunge (DB) – strength | lunge | glutes/quads | dumbbell | intermediate | 3×10–14 steps/leg',
  'Step-up (DB) – strength | lunge | glutes/quads | dumbbell | beginner | 3×8–10/leg',
  'Romanian Deadlift (Barbell) – strength | hinge | hamstrings/glutes | barbell | intermediate | 4×6–10, rest 90–120s',
  'DB Romanian Deadlift – strength | hinge | hamstrings/glutes | dumbbell | beginner | 3×8–12',
  'Conventional Deadlift – strength | hinge | posterior chain | barbell | advanced | 5×3–5, rest 180s',
  'Sumo Deadlift – strength | hinge | glutes/adductors | barbell | intermediate | 4×4–6',
  'Hip Thrust (Barbell) – strength | hinge | glutes | barbell | intermediate | 4×8–12',
  'Glute Bridge (Bodyweight) – strength | hinge | glutes | bodyweight | beginner | 3×15–20',
  'Single-leg Glute Bridge – strength | hinge | glutes | bodyweight | intermediate | 3×10–15/leg',
  'DB Goblet Reverse Lunge to Step-up – strength | lunge | glutes/quads | dumbbell | advanced | 3×6–8/leg',
  'Standing Calf Raise – strength | gait | calves | bodyweight | beginner | 3×15–20',
  'Seated Calf Raise (DB on knees) – strength | gait | calves | dumbbell | beginner | 3×12–15',
  'Heel-elevated Goblet Squat – strength | squat | quads | dumbbell | intermediate | 3×10–12',
  
  // 3.2 Upper Body – Push
  'Push-up – strength | horizontal_push | chest/triceps | bodyweight | beginner | 3×AMRAP (6–15), rest 60s',
  'Incline Push-up – strength | horizontal_push | chest | bodyweight | beginner | 3×10–15',
  'Knee Push-up – strength | horizontal_push | chest/triceps | bodyweight | beginner | 3×10–15',
  'Flat DB Bench Press – strength | horizontal_push | chest/triceps | dumbbell | beginner | 3×8–12',
  'Barbell Bench Press – strength | horizontal_push | chest/triceps | barbell | intermediate | 4×5–8',
  'Incline DB Bench Press – strength | horizontal_push | upper chest | dumbbell | intermediate | 4×8–10',
  'DB Floor Press – strength | horizontal_push | chest/triceps | dumbbell | beginner | 3×8–12',
  'Overhead Press (Barbell) – strength | vertical_push | delts/triceps | barbell | intermediate | 4×5–8',
  'Seated DB Shoulder Press – strength | vertical_push | delts/triceps | dumbbell | beginner | 3×8–12',
  'Arnold Press – strength | vertical_push | delts | dumbbell | intermediate | 3×8–10',
  'Lateral Raise (DB) – hypertrophy | accessory | medial delts | dumbbell | beginner | 3×12–15',
  'Front Raise (DB or Plate) – hypertrophy | accessory | anterior delts | dumbbell | beginner | 3×12–15',
  'Dip (Assisted) – strength | vertical_push | chest/triceps | machine/bodyweight | intermediate | 3×6–10',
  'Bench Dip (Feet on floor) – strength | vertical_push | triceps | bodyweight | beginner | 3×8–12',
  'Triceps Rope Pushdown – strength | accessory | triceps | cable | beginner | 3×10–15',
  'Skull Crushers (EZ Bar) – strength | accessory | triceps | barbell | intermediate | 3×8–12',
  
  // 3.3 Upper Body – Pull
  'Inverted Row (Bodyweight) – strength | horizontal_pull | upper back | bodyweight | beginner | 3×6–12',
  'Lat Pulldown (Wide Grip) – strength | vertical_pull | lats | machine/cable | beginner | 3×8–12',
  'Lat Pulldown (Neutral Grip) – strength | vertical_pull | lats/biceps | machine/cable | beginner | 3×8–12',
  'Pull-up (Assisted) – strength | vertical_pull | lats/biceps | machine/bodyweight | intermediate | 3×5–8',
  'Pull-up (Bodyweight) – strength | vertical_pull | lats/biceps | bodyweight | advanced | 4×3–6',
  'Chin-up (Supinated Grip) – strength | vertical_pull | lats/biceps | bodyweight | advanced | 4×3–6',
  'Bent-over Row (Barbell) – strength | horizontal_pull | lats/rhomboids | barbell | intermediate | 4×6–10',
  'DB Row (Single-arm) – strength | horizontal_pull | lats/rhomboids | dumbbell | beginner | 3×8–12/side',
  'Chest-supported Row (DB) – strength | horizontal_pull | mid-back | dumbbell | intermediate | 3×8–12',
  'Cable Row (Seated) – strength | horizontal_pull | lats/rhomboids | cable | beginner | 3×10–12',
  'Face Pull – strength | accessory | rear delts/upper traps | cable/band | beginner | 3×12–15',
  'DB Rear Delt Fly (Incline) – hypertrophy | accessory | rear delts | dumbbell | intermediate | 3×12–15',
  'Barbell Curl – strength | accessory | biceps | barbell | beginner | 3×8–12',
  'DB Hammer Curl – strength | accessory | biceps/brachialis | dumbbell | beginner | 3×10–12',
  'Incline DB Curl – hypertrophy | accessory | biceps | dumbbell | intermediate | 3×8–12',
  
  // 3.4 Core & Anti-rotation
  'Front Plank – core | static | abs | bodyweight | beginner | 3×20–40s',
  'Side Plank – core | anti_lateral_flexion | obliques | bodyweight | beginner | 3×20–30s/side',
  'Dead Bug – core | anti_extension | deep core | bodyweight | beginner | 3×8–10/side',
  'Pallof Press (Cable/Band) – core | anti_rotation | obliques | cable/band | beginner | 3×10–12/side',
  'Hanging Knee Raise – core | hip_flexion | abs/hip flexors | bodyweight | intermediate | 3×8–12',
  'Hanging Leg Raise – core | hip_flexion | abs/hip flexors | bodyweight | advanced | 3×6–10',
  'Cable Woodchop (High-to-Low) – core | rotation | obliques | cable | intermediate | 3×10–12/side',
  'Ab Wheel Rollout (Knees) – core | anti_extension | abs | wheel/barbell | intermediate | 3×6–10',
  'Sit-up (Anchored) – core | flexion | abs | bodyweight | beginner | 3×12–20',
  'Reverse Crunch – core | flexion | lower abs | bodyweight | beginner | 3×10–15',
  
  // 3.5 Full Body / Power / Athletic
  'Kettlebell Swing – conditioning | hinge/power | glutes/hamstrings | kettlebell | intermediate | 3×20–30, rest 60–90s',
  'Kettlebell Goblet Squat to Press – conditioning | squat + vertical_push | full body | kettlebell | intermediate | 3×8–10',
  'DB Thruster – conditioning | squat + vertical_push | quads/shoulders | dumbbell | advanced | 3×6–10',
  'Clean Pull (Barbell) – power | hinge | posterior chain | barbell | advanced | 4×3',
  'High Pull (Barbell) – power | hinge | traps/posterior chain | barbell | advanced | 4×3–5',
  'Farmer\'s Carry (DB or KB) – carry | gait | grip/traps | dumbbell/kettlebell | intermediate | 4×20–30m',
  'Overhead Carry (DB or KB) – carry | gait | shoulders/core | dumbbell/kettlebell | intermediate | 3×15–25m/side',
  'Sled Push – conditioning | drive | legs/glutes | sled | intermediate | 6×20–40m, rest 60s',
  'Sled Drag (Backwards) – rehab/conditioning | gait | quads | sled | beginner | 4×20–30m',
  'Burpee (Strict) – conditioning | full body | full body | bodyweight | advanced | 3×10–15',
  
  // 3.6 Machine-Specific Exercises
  'Leg Press (45°) – strength | squat | quads/glutes | machine: Leg Press | beginner–intermediate | 4×8–12',
  'Hack Squat Machine – strength | squat | quads | machine: Hack Squat | intermediate | 4×8–10',
  'Leg Extension – strength | accessory | quads | machine: Leg Extension | beginner | 3×10–15',
  'Seated Leg Curl – strength | accessory | hamstrings | machine: Leg Curl | beginner | 3×10–15',
  'Lying Leg Curl – strength | accessory | hamstrings | machine: Leg Curl | intermediate | 3×8–12',
  'Standing Calf Raise Machine – strength | gait | calves | machine: Calf Raise | beginner | 4×12–15',
  'Seated Calf Raise Machine – strength | gait | calves | machine | beginner | 3×12–15',
  'Hip Abductor Machine – strength | accessory | glute med | machine | beginner | 3×12–15',
  'Hip Adductor Machine – strength | accessory | adductors | machine | beginner | 3×12–15',
  'Glute Kickback Machine – strength | hinge | glutes | machine | beginner | 3×10–12/leg',
  'Chest Press Machine – strength | horizontal_push | chest/triceps | machine | beginner | 3×8–12',
  'Incline Chest Press Machine – strength | horizontal_push | upper chest | machine | intermediate | 3×8–12',
  'Shoulder Press Machine – strength | vertical_push | delts | machine | beginner | 3×8–12',
  'Pec Deck (Chest Fly) – hypertrophy | accessory | chest | machine | beginner | 3×10–15',
  'Cable Crossover (High to Low) – hypertrophy | accessory | lower chest | cable | intermediate | 3×10–15',
  'Lat Pulldown Machine – strength | vertical_pull | lats | machine | beginner | 3×8–12',
  'Seated Row Machine – strength | horizontal_pull | mid-back | machine | beginner | 3×8–12',
  'Assisted Dip Machine – strength | vertical_push | chest/triceps | machine | beginner | 3×6–10',
  'Assisted Pull-up Machine – strength | vertical_pull | lats | machine | beginner | 3×6–10',
  'Cable Biceps Curl – accessory | biceps | cable | beginner | 3×10–15',
  'Reverse Hyper (Machine) – strength/rehab | hinge | glutes/low back | machine: Reverse Hyper | intermediate | 3×10–15',
  
  // 3.7 Cardio Machines
  'Treadmill Walk (Flat) – cardio | gait | legs | treadmill | beginner | 20–30 min @ RPE 4–6',
  'Treadmill Incline Walk – cardio | gait | glutes | treadmill | beginner | 20–30 min @ RPE 5–7',
  'Treadmill Jog – cardio | gait | legs | treadmill | intermediate | 20–30 min @ RPE 6–8',
  'Stationary Bike (Upright) – cardio | gait | quads/glutes | bike | beginner | 20–30 min',
  'Stationary Bike (Intervals) – cardio | intervals | full legs | bike | intermediate | 10×1 min hard / 1 min easy',
  'Rowing Machine – cardio | full_body | posterior chain | rower | intermediate | 20 min steady or 8×500 m intervals',
  'Elliptical Trainer – cardio | low_impact | full body | elliptical | beginner | 20–30 min',
  'Stair Climber – cardio | gait | quads/glutes | stair machine | intermediate | 15–20 min',
  'Air Bike (Assault Bike) – conditioning | full body | arms/legs | air bike | advanced | 10×20s hard / 100s easy',
  'SkiErg – conditioning | upper | lats/triceps | ski machine | intermediate | 10×250 m',
  
  // 3.8 Mobility & Stretch
  'Hip Flexor Stretch (Half-kneeling) – stretch | hip_flexor | hip flexors | bodyweight | beginner | 2×30s/side',
  'Hamstring Stretch (Supine Band) – stretch | hamstrings | bodyweight/band | beginner | 2×30s/side',
  'Child\'s Pose – mobility | low_back | bodyweight | beginner | 2×45s',
  'Cat-Cow – mobility | spine | bodyweight | beginner | 2×10–12 reps',
  '90/90 Hip Switches – mobility | hips | bodyweight | beginner | 2×10/side',
  'Pigeon Stretch – stretch | glutes | bodyweight | intermediate | 2×30s/side',
  'Doorway Pec Stretch – stretch | chest | bodyweight | beginner | 2×30s/side',
  'Thoracic Extension on Foam Roller – mobility | t-spine | foam roller | beginner | 2×10 reps',
  'World\'s Greatest Stretch – mobility | multi-joint | bodyweight | intermediate | 2×5/side',
  'Ankle Dorsiflexion Rock-Backs – mobility | ankle | bodyweight | beginner | 2×12/side',
  
  // 3.9 Rehab / Low Impact
  'Sit-to-Stand from Box/Chair – strength/rehab | squat | quads | bodyweight | beginner | 3×8–10',
  'Wall Sit – strength/rehab | static_squat | quads | bodyweight | beginner | 3×20–40s',
  'Heel Slides (Hamstring) – rehab | knee_flexion | hamstrings | sliders/towel | beginner | 2×12',
  'Mini Band Lateral Walk – rehab | glute_med | band | beginner | 3×10 steps/side',
  'Clamshells (Band or Bodyweight) – rehab | glute_med | band/bodyweight | beginner | 3×12–15/side',
  'Bird Dog – rehab/core | anti_rotation | spinal stabilizers | bodyweight | beginner | 3×8–10/side',
  'Marching Glute Bridge – rehab | hinge | glutes/core | bodyweight | beginner | 3×10–12',
  'Supported Split Squat (Holding Rail) – rehab | lunge | quads/glutes | bodyweight | beginner | 3×6–8/leg',
  'Tandem Stance (Balance) – rehab | balance | ankles/hip stabilizers | bodyweight | beginner | 3×20–30s',
  'Step-up Low Box (Rehab) – rehab | lunge | quads | low step | beginner | 3×8/leg',
];

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
  // CREATE EXERCISE LIBRARY (Enhanced from Library.MD)
  // ============================================
  let exerciseCount = 0;
  for (const exerciseLine of libraryExercises) {
    const parsed = parseExerciseLine(exerciseLine);
    if (!parsed) continue;
    
    const existing = await prisma.exercise.findFirst({
      where: {
        name: parsed.name,
        isLibraryExercise: true,
      },
    });

    const exerciseData = {
      name: parsed.name,
      modality: parsed.modality,
      movementPattern: parsed.movementPattern,
      primaryMuscles: parsed.primaryMuscles,
      secondaryMuscles: parsed.secondaryMuscles,
      bodyRegion: parsed.bodyRegion,
      equipmentCategory: parsed.equipmentCategory,
      equipmentDetail: parsed.equipmentDetail,
      difficulty: parsed.difficulty,
      impactLevel: parsed.impactLevel,
      environment: parsed.environment,
      goalTags: parsed.goalTags,
      loggingOptions: parsed.loggingOptions,
      sets: parsed.sets,
      reps: parsed.reps,
      durationSeconds: parsed.durationSeconds,
      restSeconds: parsed.restSeconds,
      isLibraryExercise: true,
      defaultVideoSourceType: 'YOUTUBE',
      // Map to legacy fields for backward compatibility
      category: parsed.modality === 'strength' ? 'Strength' : parsed.modality === 'cardio' ? 'Cardio' : parsed.modality === 'core' ? 'Core' : parsed.modality === 'mobility' || parsed.modality === 'stretch' ? 'Mobility' : 'Other',
      equipment: parsed.equipmentDetail || parsed.equipmentCategory,
      musclesTargeted: parsed.primaryMuscles,
      notes: `Default: ${parsed.defaultPrescription || 'See prescription'}`,
    };

    if (existing) {
      await prisma.exercise.update({
        where: { id: existing.id },
        data: exerciseData,
      });
    } else {
      await prisma.exercise.create({
        data: exerciseData,
      });
      exerciseCount++;
    }
  }
  console.log(`✅ Exercise library created (${exerciseCount} new exercises from Library.MD)`);

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
      const startOfDayHelper = (d: Date): Date => {
        const date = new Date(d);
        date.setHours(0, 0, 0, 0);
        return date;
      };
      const start = startOfDayHelper(clientRecord.programStartDate);
      
      // Create completed sessions for days 1, 3, 5 (workout days)
      const workoutDays = [1, 3, 5];
      for (const dayIndex of workoutDays) {
        const programDay = program.days.find((d: any) => d.dayIndex === dayIndex && !d.isRestDay);
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
      const todayProgramDay = program.days.find((d: any) => d.dayIndex === daysSinceStart && !d.isRestDay);

      if (todayProgramDay && todayProgramDay.workout) {
        // Create a completed session from 3 days ago with FULL set logs for ALL exercises
        const threeDaysAgo = new Date(today);
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        threeDaysAgo.setHours(8, 0, 0, 0);

        const previousDayIndex = Math.max(1, daysSinceStart - 3);
        const previousProgramDay = program.days.find((d: any) => d.dayIndex === previousDayIndex && !d.isRestDay);

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

    // Create directly assigned workouts for today for client@nelsyfit.demo
    const demoClient = await prisma.user.findUnique({
      where: { email: 'client@nelsyfit.demo' },
      include: { client: true },
    });

    if (demoClient && demoClient.client) {
      // Find or create a workout with videos
      let assignedWorkout = await prisma.workout.findFirst({
        where: {
          coachId: { not: null },
          sections: { some: {} },
        },
        include: {
          sections: {
            include: {
              blocks: {
                include: {
                  exercises: {
                    include: {
                      exercise: {
                        include: {
                          coachVideos: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 1,
      });

      // If no workout exists or workout has no exercises, create/update one with exercises
      let needsWorkout = !assignedWorkout;
      if (assignedWorkout) {
        // Check if workout has exercises
        const exerciseCount = assignedWorkout.sections.reduce((sum: number, s: any) => 
          sum + (s.blocks?.reduce((blockSum: number, b: any) => blockSum + (b.exercises?.length || 0), 0) || 0), 0
        );
        if (exerciseCount === 0) {
          needsWorkout = true;
          console.log('⚠️ Workout exists but has no exercises, will create new one');
        }
      }

      if (needsWorkout) {
        const coach = await prisma.user.findFirst({
          where: { email: 'coach@nelsyfit.demo' },
        });

        if (coach) {
          // Get exercises (prefer with videos, but use any if needed)
          let exercisesToUse = await prisma.exercise.findMany({
            where: {
              OR: [
                { defaultVideoUrl: { not: null } },
                { coachVideos: { some: { coachId: coach.id } } },
              ],
            },
            take: 5,
          });

          // If no exercises with videos, get any exercises
          if (exercisesToUse.length === 0) {
            exercisesToUse = await prisma.exercise.findMany({
              take: 5,
            });
          }

          // If still no exercises, create some basic ones
          if (exercisesToUse.length === 0) {
            const basicExercises = [
              { name: 'Squat', category: 'Lower Body', equipment: 'Bodyweight', musclesTargeted: ['quads', 'glutes'] },
              { name: 'Push-up', category: 'Upper Body', equipment: 'Bodyweight', musclesTargeted: ['chest', 'triceps'] },
              { name: 'Plank', category: 'Core', equipment: 'Bodyweight', musclesTargeted: ['abs'] },
            ];

            for (const ex of basicExercises) {
              const created = await prisma.exercise.create({
                data: {
                  name: ex.name,
                  category: ex.category,
                  equipment: ex.equipment,
                  musclesTargeted: ex.musclesTargeted,
                  sets: 3,
                  reps: 10,
                  restSeconds: 60,
                  isLibraryExercise: true,
                },
              });
              exercisesToUse.push(created);
            }
          }

          if (exercisesToUse.length > 0) {
            // Delete old workout if it exists but has no exercises
            if (assignedWorkout && assignedWorkout.id) {
              await prisma.workout.delete({
                where: { id: assignedWorkout.id },
              }).catch(() => {}); // Ignore if already deleted
            }

            // Create a workout with multiple exercises
            assignedWorkout = await prisma.workout.create({
              data: {
                name: 'Full Body Strength - Today\'s Workout',
                description: 'Complete full body workout for testing all features',
                coachId: coach.id,
                goal: 'STRENGTH',
                difficulty: 'INTERMEDIATE',
                estimatedDuration: 45,
                sections: {
                  create: [
                    {
                      name: 'Warm-up',
                      order: 0,
                      blocks: {
                        create: {
                          type: 'STANDARD_SETS_REPS',
                          order: 0,
                          exercises: {
                            create: exercisesToUse.slice(0, 1).map((ex, idx) => ({
                              name: ex.name,
                              category: ex.category,
                              equipment: ex.equipment,
                              musclesTargeted: ex.musclesTargeted || [],
                              targetRepsBySet: [10, 10],
                              targetWeightBySet: null,
                              targetRestBySet: [30, 30],
                              order: idx,
                              exerciseId: ex.id,
                            })),
                          },
                        },
                      },
                    },
                    {
                      name: 'Main Workout',
                      order: 1,
                      blocks: {
                        create: {
                          type: 'STANDARD_SETS_REPS',
                          order: 0,
                          exercises: {
                            create: exercisesToUse.slice(1, 4).map((ex, idx) => ({
                              name: ex.name,
                              category: ex.category,
                              equipment: ex.equipment,
                              musclesTargeted: ex.musclesTargeted || [],
                              targetRepsBySet: [10, 10, 8],
                              targetWeightBySet: [60, 65, 70],
                              targetRestBySet: [60, 60, 90],
                              order: idx,
                              exerciseId: ex.id,
                            })),
                          },
                        },
                      },
                    },
                  ],
                },
              },
              include: {
                sections: {
                  include: {
                    blocks: {
                      include: {
                        exercises: {
                          include: {
                            exercise: {
                              include: {
                                coachVideos: true,
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            });
            console.log(`✅ Created workout with ${exercisesToUse.length} exercises for seed data`);
          }
        }
      }

      // Create a scheduled session for today if it doesn't exist
      if (assignedWorkout) {
        const today = new Date();
        today.setHours(9, 0, 0, 0);
        const todayEnd = new Date(today);
        todayEnd.setDate(todayEnd.getDate() + 1);

        const existingAssignedSession = await prisma.workoutSession.findFirst({
          where: {
            clientId: demoClient.id,
            workoutId: assignedWorkout.id,
            dateTimeStarted: {
              gte: today,
              lt: todayEnd,
            },
          },
        });

        // Create or update session with specific ID for testing
        const specificSessionId = 'cmijfjzxk0001dxafb5fba5dk';
        
        // Check if session with this ID already exists
        const existingSpecificSession = await prisma.workoutSession.findUnique({
          where: { id: specificSessionId },
        });

        if (!existingSpecificSession) {
          // Delete any existing session for today if it exists
          if (existingAssignedSession && existingAssignedSession.id !== specificSessionId) {
            await prisma.workoutSession.delete({
              where: { id: existingAssignedSession.id },
            });
          }

          await prisma.workoutSession.create({
            data: {
              id: specificSessionId,
              clientId: demoClient.id,
              workoutId: assignedWorkout.id,
              status: 'IN_PROGRESS',
              dateTimeStarted: today,
            },
          });
          console.log(`✅ Created workout session with ID ${specificSessionId} for today (client@nelsyfit.demo)`);
        } else {
          // Update existing session to ensure it's for today and has the correct workout
          await prisma.workoutSession.update({
            where: { id: specificSessionId },
            data: {
              clientId: demoClient.id,
              workoutId: assignedWorkout.id,
              status: 'IN_PROGRESS',
              dateTimeStarted: today,
            },
          });
          console.log(`✅ Updated workout session with ID ${specificSessionId} for today`);
        }

        // Verify the workout has exercises
        const workoutCheck = await prisma.workout.findUnique({
          where: { id: assignedWorkout.id },
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

        const totalExercises = workoutCheck?.sections.reduce((sum: number, s: any) => 
          sum + (s.blocks?.reduce((blockSum: number, b: any) => blockSum + (b.exercises?.length || 0), 0) || 0), 0
        ) || 0;

        console.log(`📊 Workout "${assignedWorkout.name}" has ${totalExercises} exercises across ${workoutCheck?.sections.length || 0} sections`);
        
        if (totalExercises === 0) {
          console.warn('⚠️ WARNING: Workout has no exercises! This will cause "No exercises found" error.');
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
