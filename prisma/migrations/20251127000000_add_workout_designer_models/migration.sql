-- CreateEnum
CREATE TYPE "WorkoutGoal" AS ENUM ('STRENGTH', 'HYPERTROPHY', 'FAT_LOSS', 'GENERAL_FITNESS', 'ENDURANCE', 'MOBILITY');

-- CreateEnum
CREATE TYPE "WorkoutDifficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "TrainingEnvironment" AS ENUM ('GYM', 'HOME', 'BODYWEIGHT', 'OUTDOOR');

-- CreateEnum
CREATE TYPE "SessionType" AS ENUM ('STRENGTH', 'CIRCUIT', 'HIIT', 'MOBILITY', 'RECOVERY');

-- CreateEnum
CREATE TYPE "BlockType" AS ENUM ('STANDARD_SETS_REPS', 'CIRCUIT', 'AMRAP', 'EMOM', 'HIIT_INTERVAL', 'CUSTOM');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'ABORTED');

-- CreateEnum
CREATE TYPE "FeelingCode" AS ENUM ('TOO_EASY', 'GOOD_CHALLENGE', 'HARD', 'FAILED_REPS', 'PAIN');

-- AlterTable
ALTER TABLE "Workout" ADD COLUMN IF NOT EXISTS "goal" "WorkoutGoal",
ADD COLUMN IF NOT EXISTS "difficulty" "WorkoutDifficulty",
ADD COLUMN IF NOT EXISTS "trainingEnvironment" "TrainingEnvironment",
ADD COLUMN IF NOT EXISTS "primaryBodyFocus" TEXT,
ADD COLUMN IF NOT EXISTS "estimatedDuration" INTEGER,
ADD COLUMN IF NOT EXISTS "sessionTypes" "SessionType"[] DEFAULT ARRAY[]::"SessionType"[],
ADD COLUMN IF NOT EXISTS "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS "visibility" "TemplateVisibility" DEFAULT 'PRIVATE',
ADD COLUMN IF NOT EXISTS "usageCount" INTEGER DEFAULT 0;

-- CreateTable
CREATE TABLE IF NOT EXISTS "WorkoutSection" (
    "id" TEXT NOT NULL,
    "workoutId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Section',
    "order" INTEGER NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkoutSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "WorkoutBlock" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "type" "BlockType" NOT NULL,
    "title" TEXT,
    "instructions" TEXT,
    "rounds" INTEGER,
    "restBetweenRounds" INTEGER,
    "estimatedTime" INTEGER,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkoutBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "WorkoutExercise" (
    "id" TEXT NOT NULL,
    "blockId" TEXT NOT NULL,
    "exerciseId" TEXT,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "equipment" TEXT,
    "musclesTargeted" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,
    "coachNotes" TEXT,
    "targetRepsBySet" JSONB NOT NULL,
    "targetWeightBySet" JSONB,
    "targetRestBySet" JSONB,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkoutExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "WorkoutSession" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "workoutId" TEXT NOT NULL,
    "programDayId" TEXT,
    "dateTimeStarted" TIMESTAMP(3) NOT NULL,
    "dateTimeCompleted" TIMESTAMP(3),
    "status" "SessionStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "clientNotes" TEXT,
    "coachNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkoutSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "ExerciseSetLog" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "workoutExerciseId" TEXT NOT NULL,
    "exerciseId" TEXT,
    "exerciseName" TEXT NOT NULL,
    "setNumber" INTEGER NOT NULL,
    "targetReps" INTEGER NOT NULL,
    "targetWeight" DOUBLE PRECISION,
    "targetUnit" TEXT NOT NULL DEFAULT 'kg',
    "actualReps" INTEGER,
    "actualWeight" DOUBLE PRECISION,
    "actualUnit" TEXT NOT NULL DEFAULT 'kg',
    "feelingCode" "FeelingCode",
    "feelingEmoji" TEXT,
    "feelingNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExerciseSetLog_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Exercise" ADD COLUMN IF NOT EXISTS "category" TEXT,
ADD COLUMN IF NOT EXISTS "equipment" TEXT,
ADD COLUMN IF NOT EXISTS "musclesTargeted" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS "isLibraryExercise" BOOLEAN DEFAULT false;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "WorkoutSession_clientId_dateTimeStarted_idx" ON "WorkoutSession"("clientId", "dateTimeStarted");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "WorkoutSection_workoutId_order_key" ON "WorkoutSection"("workoutId", "order");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "WorkoutBlock_sectionId_order_key" ON "WorkoutBlock"("sectionId", "order");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "WorkoutExercise_blockId_order_key" ON "WorkoutExercise"("blockId", "order");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "ExerciseSetLog_sessionId_workoutExerciseId_setNumber_key" ON "ExerciseSetLog"("sessionId", "workoutExerciseId", "setNumber");

-- AddForeignKey (with IF NOT EXISTS check)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'WorkoutSection_workoutId_fkey'
    ) THEN
        ALTER TABLE "WorkoutSection" ADD CONSTRAINT "WorkoutSection_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "Workout"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'WorkoutBlock_sectionId_fkey'
    ) THEN
        ALTER TABLE "WorkoutBlock" ADD CONSTRAINT "WorkoutBlock_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "WorkoutSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'WorkoutExercise_blockId_fkey'
    ) THEN
        ALTER TABLE "WorkoutExercise" ADD CONSTRAINT "WorkoutExercise_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "WorkoutBlock"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'WorkoutExercise_exerciseId_fkey'
    ) THEN
        ALTER TABLE "WorkoutExercise" ADD CONSTRAINT "WorkoutExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'WorkoutSession_clientId_fkey'
    ) THEN
        ALTER TABLE "WorkoutSession" ADD CONSTRAINT "WorkoutSession_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'WorkoutSession_workoutId_fkey'
    ) THEN
        ALTER TABLE "WorkoutSession" ADD CONSTRAINT "WorkoutSession_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "Workout"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'WorkoutSession_programDayId_fkey'
    ) THEN
        ALTER TABLE "WorkoutSession" ADD CONSTRAINT "WorkoutSession_programDayId_fkey" FOREIGN KEY ("programDayId") REFERENCES "ProgramDay"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'ExerciseSetLog_sessionId_fkey'
    ) THEN
        ALTER TABLE "ExerciseSetLog" ADD CONSTRAINT "ExerciseSetLog_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "WorkoutSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'ExerciseSetLog_workoutExerciseId_fkey'
    ) THEN
        ALTER TABLE "ExerciseSetLog" ADD CONSTRAINT "ExerciseSetLog_workoutExerciseId_fkey" FOREIGN KEY ("workoutExerciseId") REFERENCES "WorkoutExercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

