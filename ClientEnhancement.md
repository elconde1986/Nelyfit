elow is a clean, ready-to-paste Markdown rewrite of the route documentation for:

/client/today

/client/program-map

This version fully incorporates the new behaviors:

Clickable days

Per-set logging

Day Details modal/screen

Functional Start Workout button

Ability to start/resume historical and upcoming sessions

This is formatted to drop directly into your existing MD requirements file.

/client/today — Client Today View (Enhanced Specification)
Purpose

The Today page is the client’s main entry point into their daily training. It shows:

Today’s workout (derived from their assigned program)

Streak, XP, badges earned

Buttons to start, resume, or review the workout

Integration with per-set logging and session management

This page must always reflect real-time workout status (not static content).

Functional Requirements
1. Show Today’s Scheduled Workout

When the page loads:

Retrieve the client’s active program assignment.

Determine if today has a Program Day with a workout assigned.

Show a card with:

Workout name

Estimated duration

Goal tags

Equipment icons

Streak & XP for today

Workout status:

Not Started

In Progress

Completed

No Workout Assigned

If no workout is scheduled:

Show: “Rest Day – No workout today”

Button: “View Program Map”

2. Start Workout Button (New Behavior)

Current issue: Button does nothing.

New Behavior:

When user taps Start Workout:

Frontend calls:

POST /api/client/workouts/start (no date → defaults to today)

API determines:

Scheduled workout_id for today

If a WorkoutSession already exists:

Return the existing sessionId (resume mode)

Otherwise:

Create a new WorkoutSession with:

status = IN_PROGRESS

scheduledDate = today

pre-seeded set logs (optional)

On success:

Navigate to:
/client/workout/{sessionId}

This ensures Today → Start Workout always produces a functional session.

3. Resume Workout (If already started)

If a session for today exists with status = IN_PROGRESS:

Replace Start button with:

Resume Workout

Tapping navigates to /client/workout/{sessionId} without new session creation.

4. Completed Workout State

If today’s workout was completed:

Show:

Completed badge

XP gained

Streak counter

Button:

View Log → Opens Day Details view for today
(with per-set actuals)

5. Integrations

Clicking “Program Map” opens /client/program-map

Clicking “Badges” opens /client/badges

Clicking “Chat with Coach” opens /client/chat

/client/program-map — Program Map (Enhanced Specification)
Purpose

Provide a visual, Duolingo-inspired map of the client’s entire training program:
Weeks → Days → Workouts → Progress → Detailed logs.

The user can now:

Tap ANY day

View workout details

Start/resume that workout

Edit per-set logs for completed days

Functional Requirements
1. Program Map Layout

Calendar-style list of weeks

Each week shows 7 nodes (Mon–Sun)

Node states:

Today (blue)

Completed (green)

Upcoming (grey)

Missed (red outline)

Rest Day (yellow)

All non-rest nodes are clickable.

2. Day Details View (New Feature)

Tapping any day opens:

Day Details (a modal OR a route such as
/client/program-map/day/[yyyy-mm-dd])

Day Details Includes:

Date header

Node state indicator

Workout summary

Workout name

Estimated duration

Goal tags

Equipment icons

Actions (depending on state)
Day State	Button / Behavior
Today – not started	Start Workout → new session created
Today – in progress	Resume Workout → go to running session
Today – completed	View/Edit Log
Upcoming Day	Start This Workout (allowed)
Missed Day	Log Manually (optional)
Rest Day	No action
3. Per-Set Logging in Day Details

Day Details shows the workout’s exercise list:

For each exercise:

Exercise name

Prescribed sets & reps/time

A table of set logs:

Set	Planned Reps	Actual Reps	Planned Weight	Actual Weight	Extra Set?

Clients can:

Edit individual sets

Add extra sets

Save logs back to the session via API

4. API Required for Day Details
GET program day details

GET /api/client/program-day-details?date=YYYY-MM-DD

Returns:

{
  "date": "2025-02-22",
  "status": "TODAY | COMPLETED | UPCOMING | MISSED | REST",
  "workout": { ... },
  "session": { ... },
  "exerciseLogs": [ ... ]
}

Start workout for a given day

POST /api/client/workouts/start

Body supports optional date:

{
  "date": "2025-02-22"
}

Update per-set logs

PATCH /api/client/workout-sessions/{sessionId}/exercise-logs

5. Program Map Animations / UX Notes

Completed days animate a pulsing green border

Today node glows to highlight interaction

When user completes a workout:

Show confetti overlay

Automatically update that day’s node

6. Edge Case Handling

Client without a program → Map shows: “You have no assigned program.”

Multiple sessions on same day → Show a list inside Day Details.

Editing logs after many days → Allowed for now, flagged for coach.

Summary of Enhancements

/client/today now STARTS and RESUMES workouts properly

/client/program-map now fully interactive

A new Day Details view standardizes:

Viewing planned workout

Reviewing past workouts

Editing per-set logs

Starting future/past workouts

Complete API model included

Complete data model updates included