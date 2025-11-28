1. Purpose

This screen is the live workout experience for clients.

It must:

Look and feel like the reference screenshots:

Session header with time, calories, HR zone, cancel/save.

Per-exercise blocks with “Previous” vs “Reps / Lbs” columns.

Add new set per exercise.

Insert Exercise at the bottom.

Still obey NelyFit’s core concept:

Session is linked to a Program Day + Workout.

Logging is per set and feeds streak, XP, badges.

Data is available to coaches in the Client 360 + Coach dashboard.

2. Entry & Exit
2.1 Entry Points

From /client/today

“Start Workout” or “Resume Workout” → navigates to /client/workout/[sessionId].

From /client/program-map → Day Details

“Start This Workout” / “Resume Workout” buttons.

On entry, the app must:

Fetch session view data by sessionId.

Initialize session timer (TIME) based on:

performedAt for in-progress sessions, or

current time for newly created sessions.

2.2 Exit Behavior

Cancel:

Shows confirm dialog:

“Discard this workout?”

Options:

“Discard” → set completionStatus = ABANDONED and return to /client/today.

“Save as draft” (optional v2) → keep IN_PROGRESS and return.

“Keep working” → close dialog.

Save:

Saves all logs but does not necessarily mark session completed.

Bottom “Finish workout” (if present) or explicit “Mark completed” in header will:

Call “complete session” API.

Trigger XP/streak update.

Redirect back to:

/client/today or Day Details (configurable; default: Today).

3. Screen Layout
3.1 Top App Bar

Elements (left → right):

Cancel (text button)

Session timer icon (tap to pause/resume or reset timer; optional v1: read-only)

“+” Quick action menu (optional future: add note, add photo, etc.)

More menu (⋮) (optional: view summary, delete session)

Save (primary text button)

Visual: closely mirrors reference UI but with NelyFit styling.

3.2 Session Stats Ribbon

Directly under app bar, a fixed horizontal ribbon:

TIME:

Running timer (HH:MM:SS)

Active Calories:

Active label + numeric calories (if unavailable, show “— Cal”)

Heart Rate / Zone:

Zone label (Zone 1–5) + current HR

Only shown if HR integration is enabled for client; otherwise hide or show simple “Intensity” placeholder.

HR and calories are “data slots”. For MVP they can be estimates or stubbed, but the UI space must exist.

3.3 Exercise List (Scrollable)

Below the stats ribbon: vertical scroll of exercise blocks, one per WorkoutExercise.

Each block corresponds to a single exercise in the workout.

4. Exercise Block Specification

Each exercise “card” shows structure very close to the screenshot.

4.1 Exercise Header

Thumbnail or coach video preview (small square).

Exercise name (from Exercise entity).

Prescription line (from WorkoutExercise + Exercise):

E.g. 4 sets × Working Set 8–10 reps

Or 2 sets × 45 reps Rest Pause.

Overflow (⋮) menu per exercise:

Options:

“View technique video” (opens coach/global video)

“View exercise details” (muscles, cues, safety)

“Remove from workout” (session only, not from template)

Future: “Swap exercise”

4.2 Rest Between Sets Row

Optional row under the header:

Text: “Rest between each set”

Rest timer icon (e.g., ⏱ 60s)

Tapping starts a per-exercise countdown timer.

Timer overlays on screen and/or uses haptics when rest is done.

If WorkoutExercise has restSeconds, show that value.

4.3 Per-Set Table

Columns:

Set

Sequential number (1, 2, 3, ...)

Previous

For each set, shows previous performance:

e.g. 10 × 30 lbs

Comes from most recent completed WorkoutSession for:

same clientId + exerciseId
and ideally same workoutId.

Reps (editable)

Input field (numeric)

Lbs / Kg (editable)

Unit depends on client preference; label should change accordingly.

Behavior:

Pre-fill “Reps” and “Lbs” with planned values (from WorkoutExercise) or last session values, depending on product decision. Recommended:

Start with planned reps + planned weight (if defined).

If client taps a row:

The set is considered selected and the keyboard appears for editing.

4.4 Add New Set

At the bottom of each exercise’s table:

Link/button: “+ Add new set”

Adds a new setLogs entry for that exercise with:

isExtraSet = true

setIndex incremented.

UI: new row appears in table, with blank “Reps” and “Lbs”.

5. Global Footer Actions

At the very bottom of the session screen:

Insert Exercise button

Opens an “Insert Exercise” modal:

Search & filter through Exercise Library (same filters as Workout Builder, but simpler).

Coach video & exercise name visible.

On select:

Inserts a session-only exercise at chosen position (by default at end).

Creates a temporary WorkoutExercise/SessionExercise instance.

This does not permanently edit the saved Workout template; only affects this one session log.

Save / Finish button (large, sticky at bottom)

Saves all current set logs.

If we support a separate “Finish workout” step:

Label: Finish Workout → also calls session completion API.

After finishing:

Trigger celebration screen (XP, streak, badges).

Return to Today or Program Map.

6. Data & API Requirements (Execution Screen)

This screen relies on a single “session view” payload plus update endpoints.

6.1 Session View Payload

GET /api/client/workout-sessions/{sessionId}/view

Must return:

{
  "session": {
    "id": "sess-123",
    "clientId": "cl-1",
    "workoutId": "wo-9",
    "scheduledDate": "2025-02-22",
    "performedAt": "2025-02-22T06:10:00Z",
    "completionStatus": "IN_PROGRESS",
    "totalTimeSeconds": 2457,
    "xpEarned": 0
  },
  "workout": {
    "id": "wo-9",
    "name": "Lower Body Strength",
    "estimatedDurationMinutes": 45
  },
  "exercises": [
    {
      "workoutExerciseId": "we-1",
      "exerciseId": "ex-DB-RDL",
      "section": "MAIN",
      "orderIndex": 1,
      "name": "DB RDL FBF 2.0",
      "prescription": "4 sets × Working Set 8–10 reps",
      "restSeconds": 60,
      "thumbUrl": "...",
      "logs": {
        "setLogs": [
          {
            "setIndex": 1,
            "plannedReps": 10,
            "actualReps": 10,
            "plannedWeight": 30,
            "actualWeight": 30,
            "isExtraSet": false
          },
          ...
        ]
      },
      "previousSessionSetLogs": [
        { "setIndex": 1, "reps": 10, "weight": 30 },
        ...
      ]
    }
  ],
  "metrics": {
    "activeCalories": 176,
    "heartRate": 93,
    "heartRateZone": 1
  }
}


Notes:

previousSessionSetLogs is read-only and computed as:

The last completed session where client did this exercise.

metrics can be real or placeholder depending on wearable integration.

6.2 Update Logs (Per Set & Per Exercise)

PATCH /api/client/workout-sessions/{sessionId}/exercise-logs

Body (per exercise):

{
  "exerciseLogs": [
    {
      "workoutExerciseId": "we-1",
      "setLogs": [
        {
          "setIndex": 1,
          "actualReps": 10,
          "actualWeight": 30,
          "isExtraSet": false
        },
        {
          "setIndex": 2,
          "actualReps": 10,
          "actualWeight": 35,
          "isExtraSet": false
        },
        {
          "setIndex": 3,
          "actualReps": 10,
          "actualWeight": 35,
          "isExtraSet": false
        },
        {
          "setIndex": 4,
          "actualReps": 8,
          "actualWeight": 40,
          "isExtraSet": false
        },
        {
          "setIndex": 5,
          "actualReps": 8,
          "actualWeight": 40,
          "isExtraSet": true
        }
      ]
    }
  ]
}


Behavior:

Upsert setLogs per (sessionId, workoutExerciseId, setIndex).

Calculate:

Extra sets (isExtraSet = true)

Total volume per exercise/whole session (optional).

Respond with updated exerciseLogs and/or success status.

6.3 Insert Exercise (Session-Only)

POST /api/client/workout-sessions/{sessionId}/insert-exercise

Body:

{
  "exerciseId": "ex-reverse-hyper",
  "insertAfterWorkoutExerciseId": "we-1"  // optional; default append
}


Behavior:

Create a SessionExercise/temporary WorkoutExercise entry:

isAdHoc = true

section defaults to MAIN (or same section as previous).

Return updated session view or the new exercise block.

6.4 Complete Session

PATCH /api/client/workout-sessions/{sessionId}/complete

Body:

{
  "notesFromClient": "Felt strong, grip fatigue at the end."
}


Behavior:

Set completionStatus = COMPLETED.

Finalize:

totalTimeSeconds

xpEarned

Streak update & badge checks.

Response includes new gamification state so we can show celebration.

7. Visual & UX Guidelines

Mimic the simple, form-like per-set grid from the screenshots:

Large tap targets for Reps/Lbs

Minimal chrome

Clear separation between exercises.

Timer & active calorie text should be always visible (sticky header).

Rest timers must be low-friction:

Single tap to start

Auto-stop when counting down to zero

“Add new set” and “Insert Exercise” should be visually consistent:

Icon + label (e.g., “+ Add new set”, “+ Insert Exercise”).

Maintain NelyFit color and gamification identity (XP, streak, badges), even if the core layout is inspired by the example app.