EPIC 1 — Client Progress Photos
File: epic-client-progress-photos.md
EPIC: Client Progress Photos

Feature Type: Tracking / Visual Progress
Owner: NelsyFit Product
Status: Planned

1. Problem Statement

Clients need a way to visually track their physical progress over time and optionally share selected images with their coach. This is standard in modern fitness apps and expected functionality.

2. Goals

Allow clients to upload, store, and view their progress photos.

Allow clients to control privacy: private or shared-with-coach.

Allow coaches to view only shared photos of their clients.

Provide timeline and grid-based review.

3. User Stories
Client

I can upload front/side/back progress photos with metadata.

I can view my progress as a timeline or gallery.

I can choose which photos my coach can see.

I can delete or update metadata on my photos.

Coach

I can view progress photos shared by my clients.

I can leave private notes (future enhancement).

Admin

I can moderate flagged/risky photos.

4. Functional Requirements
Upload

Accept image files (jpg, png, webp).

Fields:

Date taken

Pose (front, side, back)

Optional weight

Notes

Visibility toggle (private/shared)

Support multiple uploads at once.

Gallery

Grid view (thumbnails)

Timeline view (grouped by month)

Filters:

Date range

Pose

Shared vs private

Detail View

Full-size display

Metadata panel

Visibility toggle

Delete / Edit

5. Technical Requirements
Frontend

Route:
/client/progress-photos

UI Components:

UploadDialog

PhotoCard

PhotoDetailModal

TimelineView

VisibilityToggle

Backend

API route folder:
/api/tracking/progress-photos/

Endpoints:

GET /api/tracking/progress-photos
POST /api/tracking/progress-photos
PUT /api/tracking/progress-photos/:id
DELETE /api/tracking/progress-photos/:id

Database Schema (Proposed)
model ProgressPhoto {
  id           String   @id @default(cuid())
  clientId     String
  url          String
  pose         String?
  dateTaken    DateTime
  weight       Float?
  notes        String?
  sharedWithCoach Boolean @default(false)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  client Client @relation(fields: [clientId], references: [id])
}

6. Acceptance Criteria

Clients can upload, edit, and delete progress photos.

Coaches can only view photos shared by their clients.

Gallery and timeline views render correctly.

Visibility toggle updates instantly.

Photos stored securely (presigned URL or direct upload).

EN/ES localization applied.

7. Stretch Goals

Comparison slider (before/after)

AI pose detection (is this front/back/side?)

Auto-privacy blur (face detection)

📘 EPIC 2 — Client Body Measurements

File: epic-client-body-measurements.md

EPIC: Client Body Measurements

Feature Type: Tracking / Metrics
Owner: NelsyFit
Status: Planned

1. Problem Statement

Clients need a structured way to log body measurements beyond weight (waist, hips, arms, etc.). Most training programs rely on more than just scale weight.

2. Goals

Let clients record body measurements over time.

Provide historical tracking and charts.

Provide coaches access to their clients’ entries.

3. User Stories
Client

I can log my measurements with custom date.

I can see trends in charts.

I can edit or delete entries.

Coach

I can view my client’s entries.

I can use measurements to guide programming.

Admin

I can view measurement usage for analytics.

4. Functional Requirements
Logging

Fields:

Date

Weight (optional)

Measurements:

Neck

Shoulders

Chest

Waist

Hips

Thighs (L/R)

Calves (L/R)

Biceps (L/R)

Forearms (L/R)

History Table

Sorted by date

Edit/Delete controls

Units switch (metric/imperial)

Charts

Individual line charts per measurement

Range filters

5. Technical Requirements
Frontend

Route:
/client/body-measurements

Components:

MeasurementEntryForm

MeasurementsTable

MeasurementsChart

UnitSelector

Backend

Route:
/api/tracking/body-measurements

Endpoints:

GET /api/tracking/body-measurements
POST /api/tracking/body-measurements
PUT /api/tracking/body-measurements/:id
DELETE /api/tracking/body-measurements/:id

Database Schema
model BodyMeasurement {
  id        String   @id @default(cuid())
  clientId  String
  date      DateTime

  weight    Float?
  neck      Float?
  shoulders Float?
  chest     Float?
  waist     Float?
  hips      Float?
  thighL    Float?
  thighR    Float?
  calfL     Float?
  calfR     Float?
  bicepL    Float?
  bicepR    Float?
  forearmL  Float?
  forearmR  Float?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  client Client @relation(fields: [clientId], references: [id])
}

6. Acceptance Criteria

Client can log/edit/delete measurements.

Chart renders correctly for each metric.

Coach can see only their clients' measurements.

EN/ES localization supported.

7. Stretch Goals

Bodyfat calculators

AI trend insight: “Your waist dropped 5cm in 6 weeks”

📘 EPIC 3 — Challenge Detail Page
File: epic-challenge-detail.md
EPIC: Challenge Detail Page

Feature Type: Community / Engagement
Status: Planned

1. Problem Statement

Clients can see challenge listings and can join them, but they cannot view full details, rules, their progress, or a leaderboard.

2. Goals

Show challenge metadata, rules, and incentives.

Show user’s progress.

Show leaderboard (global or group).

Enable join/leave action.

3. User Stories
Client

I can see what a challenge is and how to earn points.

I can see my rank relative to others.

I can see my progress visually.

I can join or leave instantly.

Coach/Admin

I can see all participants.

I can use this for engagement insights.

4. Functional Requirements
Header

Title

Description

Start/end dates

Status badge

Rules Panel

How to earn points (XP, workouts, streaks)

Maximums

Eligibility

Your Progress

Current points

Rank

Progress bar

Activity feed (optional)

Leaderboard

Columns:

Rank

Name

Points

Group (optional)

Filtering:

Global

Group-only (if applicable)

5. Technical Requirements
Frontend

Route:
/community/challenges/[challengeId]

Components:

ChallengeHeader

ChallengeRulesCard

UserProgressCard

LeaderboardTable

JoinChallengeButton

Backend Endpoints
GET /api/community/challenges/:id
GET /api/community/challenges/:id/leaderboard
POST /api/community/challenges/join
POST /api/community/challenges/leave (optional)

6. Acceptance Criteria

Users can join/leave.

Challenge data loads correctly.

Leaderboard updates in real time.

Privacy displayed correctly (first name + last initial).

7. Stretch Goals

Challenge chat area

Streak bonuses

📘 EPIC 4 — Meal Plan Creation & Editing
File: epic-meal-plan-create-edit.md
EPIC: Meal Plan Creation + Editing

Feature Type: Nutrition
Status: Planned

1. Problem Statement

Meal plans can be viewed, but coaches cannot create/edit plans, and clients cannot create self-guided meal plans.

2. Goals

Allow coaches to create structured meal plans.

Allow clients to view plans in clean UI.

Allow grocery list generation from plan.

3. User Stories
Coach

I can create meal plans and assign them to clients.

I can edit/update plans.

Client

I can view my assigned meal plan.

I can duplicate/edit personal plans (optional).

4. Functional Requirements
Plan Metadata

Plan name

Goal (cutting, maintenance, bulking)

Calorie target

Macro targets

Days per cycle (1 / 3 / 7)

Meals

For each meal:

Meal name

Ingredients list

Instructions/notes

Macros (optional)

Assignment

Assign to:

Self (client)

Coach's client(s)

Group (optional)

Grocery Integration

“Generate Grocery List” button
→ Auto-populates grocery list page.

5. Technical Requirements
Routes:

/nutrition/meal-plans/create

/nutrition/meal-plans/[planId]

Components:

MealPlanForm

MealPlanMealCard

IngredientListEditor

MacroSummaryCard

API:

/api/nutrition/meal-plans

Methods:

GET
POST
PUT /:id
DELETE /:id

Schema (simplified):
model MealPlan {
  id         String   @id @default(cuid())
  name       String
  goal       String?
  calories   Int?
  protein    Int?
  carbs      Int?
  fats       Int?
  days       Int @default(1)
  createdBy  String // userId
  assignedTo String? // clientId
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  meals MealPlanMeal[]
}

model MealPlanMeal {
  id        String @id @default(cuid())
  planId    String
  day       Int
  name      String
  notes     String?
  ingredients String? // JSON string or list
  calories  Int?
  protein   Int?
  carbs     Int?
  fats      Int?

  mealPlan MealPlan @relation(fields: [planId], references: [id])
}

6. Acceptance Criteria

Coaches can create and assign meal plans.

Clients can view assigned plans.

Grocery lists generate correctly.

EN/ES localization supported.

7. Stretch Goals

AI meal plan generation

Barcode scanning for ingredients

Nutrition database integration (e.g., USDA)

📘 EPIC 5 — Tracking API Routes (Unified)
File: epic-tracking-api.md
EPIC: Tracking API Enhancements

Feature Type: Backend / Integration
Status: Planned

1. Problem Statement

Client-facing tracking features (photos & measurements) require consistent API support.

2. Goals

Add missing API routes for tracking.

Provide secure CRUD operations.

Maintain consistent response format.

3. Endpoints
/api/tracking/progress-photos
GET
POST
PUT /:id
DELETE /:id

/api/tracking/body-measurements
GET
POST
PUT /:id
DELETE /:id

4. Security Requirements

Must validate session & ownership.

Coaches only see their clients’ data.

Admins may see all.

5. Response Contracts
Example: GET /api/tracking/progress-photos
{
  "photos": [
    {
      "id": "xxx",
      "url": "...",
      "pose": "front",
      "dateTaken": "2024-01-01",
      "sharedWithCoach": true
    }
  ]
}

Example: Body Measurement Row
{
  "id": "xxx",
  "date": "2024-01-01",
  "waist": 31.5,
  "hips": 40.2
}

6. Acceptance Criteria

APIs return correct status codes.

Prisma integration complete.

Coach read filters enforced.

Full localization error messages.