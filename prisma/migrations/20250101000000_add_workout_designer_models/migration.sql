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
ALTER TABLE "Workout" ADD COLUMN "goal" "WorkoutGoal",
ADD COLUMN "difficulty" "WorkoutDifficulty",
ADD COLUMN "trainingEnvironment" "TrainingEnvironment",
ADD COLUMN "primaryBodyFocus" TEXT,
ADD COLUMN "estimatedDuration" INTEGER,
ADD COLUMN "sessionTypes" "SessionType"[] DEFAULT ARRAY[]::"SessionType"[],
ADD COLUMN "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "visibility" "TemplateVisibility" DEFAULT 'PRIVATE',
ADD COLUMN "usageCount" INTEGER DEFAULT 0;

-- CreateTable
CREATE TABLE "WorkoutSection" (
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
CREATE TABLE "WorkoutBlock" (
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
CREATE TABLE "WorkoutExercise" (
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
CREATE TABLE "WorkoutSession" (
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
CREATE TABLE "ExerciseSetLog" (
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
ALTER TABLE "Exercise" ADD COLUMN "category" TEXT,
ADD COLUMN "equipment" TEXT,
ADD COLUMN "musclesTargeted" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "isLibraryExercise" BOOLEAN DEFAULT false;

-- AlterTable
ALTER TABLE "ProgramDay" ADD COLUMN "sessions" TEXT[];

-- CreateIndex
CREATE INDEX "WorkoutSession_clientId_dateTimeStarted_idx" ON "WorkoutSession"("clientId", "dateTimeStarted");

-- CreateIndex
CREATE UNIQUE INDEX "WorkoutSection_workoutId_order_key" ON "WorkoutSection"("workoutId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "WorkoutBlock_sectionId_order_key" ON "WorkoutBlock"("sectionId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "WorkoutExercise_blockId_order_key" ON "WorkoutExercise"("blockId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "ExerciseSetLog_sessionId_workoutExerciseId_setNumber_key" ON "ExerciseSetLog"("sessionId", "workoutExerciseId", "setNumber");

-- AddForeignKey
ALTER TABLE "WorkoutSection" ADD CONSTRAINT "WorkoutSection_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "Workout"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutBlock" ADD CONSTRAINT "WorkoutBlock_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "WorkoutSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutExercise" ADD CONSTRAINT "WorkoutExercise_blockId_fkey" FOREIGN KEY ("blockId") REFERENCES "WorkoutBlock"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutExercise" ADD CONSTRAINT "WorkoutExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutSession" ADD CONSTRAINT "WorkoutSession_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutSession" ADD CONSTRAINT "WorkoutSession_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "Workout"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutSession" ADD CONSTRAINT "WorkoutSession_programDayId_fkey" FOREIGN KEY ("programDayId") REFERENCES "ProgramDay"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseSetLog" ADD CONSTRAINT "ExerciseSetLog_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "WorkoutSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseSetLog" ADD CONSTRAINT "ExerciseSetLog_workoutExerciseId_fkey" FOREIGN KEY ("workoutExerciseId") REFERENCES "WorkoutExercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

