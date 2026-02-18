# 🔥 IGNITE 2.0 – System & Page Architecture Plan

## Overview
Ignite 2.0 will be a controlled ideathon platform with:
- Pre-fed team data
- OCR + manual entry check-in
- Admin control panel
- Timer start for all teams
- Live team display
- Voting system (later module)
- Round management

This document defines flow + pages + logic.

## 🧠 Core Flow
### Phase 0 — Pre-Event Data Feed
Before event day:
- Import team data from Google Form
- Store in DB/JSON
- Each team has:
  - `team_id`
  - `team_name`
  - `members` (1–4)
  - `phone/email`
  - `track/theme`
  - `check_in_status`

## 🖥️ SYSTEM PAGES

### 1️⃣ PAGE: TEAM ENTRY / CHECK-IN
**Route:** `/ignite2/entry`

**Purpose:**
Register team arrival using:
- ID card OCR
- OR manual search

**Features:**
- **When team arrives:**
  - **Option A — OCR:**
    - Scan student ID card
    - Extract name/roll
    - Match with pre-fed team
    - Auto fetch team
  - **Option B — Manual:**
    - Search by: team name, member name, roll number
- **After Match:**
  - Show: Team Name, Track, Members list
- **Admin clicks:** `CHECK-IN TEAM`
  - Then:
    - team marked present
    - team appears in live dashboard
    - team form auto-created

**UI Layout:**
- Left: Camera OCR
- Right: Manual search
- Bottom: Confirm team

### 2️⃣ PAGE: LIVE TEAM LOBBY
**Route:** `/ignite2/lobby`

**Shows:**
- all checked-in teams
- track
- members
- status

Big screen friendly. Used before timer start.

### 3️⃣ ADMIN CONTROL PANEL
**Route:** `/ignite2/admin`

**Controls:**
- Start Round 1 timer
- Pause timer
- End round
- Move to Round 2
- Lock submissions
- Enable voting

**Timer Logic:**
- Admin clicks: `START IGNITE`
- Then:
  - global timer starts
  - all team screens sync
  - countdown visible

### 4️⃣ TEAM SCREEN (MAIN IGNITE PAGE)
**Route:** `/ignite2/team/[id]`

**Each team sees:**
- timer
- theme/problem
- rules
- submission box
- vote panel (later)

Auto opens when team checked-in.

### 5️⃣ TIMER SYSTEM
Central timer stored in:
- server state
- websocket broadcast

When admin clicks start: all team screens sync.

### 6️⃣ VOTING SYSTEM (Later Module)
Each team can vote for:
- 2 other teams
- cannot vote self

Rules defined later. Will create separate MD.

## 🔧 DATA STRUCTURE
```typescript
Team {
  id: string;
  name: string;
  track: string;
  members: Array<{
    name: string;
    roll: string;
    phone: string;
    email: string;
  }>;
  checked_in: boolean;
  submission: string;
  votes_received: number;
}
```

## 🧾 CHECK-IN FLOW
1. Team arrives
2. Scan ID → Match team
3. Show team card
4. Click CHECK-IN
5. Team appears on lobby screen

## ⏱️ ROUND FLOW
1. Admin panel → Click START
2. Timer begins
3. Teams work → Submit ideas
4. End round → Enable voting

## 🎨 DESIGN STYLE – IGNITE 2.0
**Theme:** Futuristic control room, Dark UI, Neon accents, Large timer
**Visuals:**
- rotating timer cube (upgrade from old)
- team cards
- track color tags
- live counter

## 📦 TECH STACK
- **Frontend:** Next.js, MUI, Framer Motion, Socket.io
- **Backend:** Express or Flask, Mongo or JSON store
- **OCR:** Tesseract.js, camera scan

## 📍 PRIORITY BUILD ORDER
1. **STEP 1:** Pre-feed team DB
2. **STEP 2:** Entry page with search & check-in button
3. **STEP 3:** Admin start timer
4. **STEP 4:** Team screen with timer sync
5. **STEP 5:** Voting module

## 🧪 FUTURE FEATURES
- leaderboard
- judge panel
- live scoring
- projector screen mode
- QR team login
- auto certificate

## ⚠️ IMPORTANT DECISIONS
- **Timer duration?** 60 min?
- **Tracks shown?** Yes/No
- **Team edits allowed?** No after check-in

## 📁 FILE STRUCTURE
```
/ignite2
  /entry
  /admin
  /lobby
  /team/[id]
  timer.ts
  socket.ts
```
