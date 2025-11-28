// Helper function to parse Library.MD exercise format
// Format: Name – modality | pattern | primaryMuscles | equipmentCategory | difficulty | default
export function parseExerciseLine(line: string) {
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
export const libraryExercises = [
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

